import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Events that grant Pro access.
 *
 * `subscription.created` and `subscription.active` are the same thing: Dodo
 * emits `subscription.active` today, the TRD alias keeps the contract in
 * TRD.md honest (INT-4.5).
 */
const ACTIVATING_EVENTS = new Set([
  "subscription.created",
  "subscription.active",
  "subscription.renewed",
  "payment.succeeded",
]);

/** Events that end a subscription (TRD alias + Dodo's canonical spelling). */
const CANCELED_EVENTS = new Set([
  "subscription.canceled",
  "subscription.cancelled",
  "subscription.expired",
]);

type Selector = {
  appUserId?: string | null;
  email?: string | null;
  subscriptionId?: string | null;
};

type ProfilePatchResult = {
  matched: boolean;
  error: { code?: string; message: string } | null;
};

/**
 * A service-role client when one is configured, so an unauthenticated webhook
 * delivery can still write the profile row (SEC-6.4).
 */
async function getClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createSupabaseServerClient();
}

/**
 * Updates the profile behind a Dodo event.
 *
 * The customer email is the primary key of the lookup because it is the only
 * identifier Dodo guarantees on a payment event (INT-4.6). The checkout
 * metadata user id and the subscription id are fallbacks for lifecycle events
 * that carry no customer object.
 */
async function updateProfile(
  supabase: SupabaseClient,
  patch: Record<string, string>,
  selector: Selector,
): Promise<ProfilePatchResult> {
  let lastError: { code?: string; message: string } | null = null;

  if (selector.email) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .ilike("email", selector.email)
      .select("id");
    if (error) lastError = error;
    else if ((data ?? []).length > 0) return { matched: true, error: null };
  }

  if (selector.appUserId) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", selector.appUserId)
      .select("id");
    if (error) lastError = error;
    else if ((data ?? []).length > 0) return { matched: true, error: null };
  }

  if (selector.subscriptionId) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("dodo_subscription_id", selector.subscriptionId)
      .select("id");
    if (error) lastError = error;
    else if ((data ?? []).length > 0) return { matched: true, error: null };
  }

  return { matched: false, error: lastError };
}

/**
 * The idempotency key for this delivery (SEC-3.5).
 *
 * The Standard Webhooks `webhook-id` header is the unique message id and is
 * what a retry reuses, so it is the primary key. The fallbacks keep the key
 * deterministic if the header is ever missing.
 */
function resolveEventId(
  payload: Record<string, unknown>,
  headerId: string | null,
  rawBody: string,
): string {
  const trimmedHeader = headerId?.trim();
  if (trimmedHeader) return trimmedHeader;

  const type = typeof payload.type === "string" ? payload.type : "event";
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const objectId =
    typeof data.id === "string"
      ? data.id
      : typeof data.subscription_id === "string"
        ? data.subscription_id
        : "";

  if (objectId) return `${type}:${objectId}`;

  return `sha256:${createHash("sha256").update(rawBody).digest("hex")}`;
}

/**
 * Claims the event id.
 *
 * Returns `false` when the event was already processed (unique-constraint
 * conflict) — the caller then answers 200 without touching the profile.
 */
async function claimEvent(
  supabase: SupabaseClient,
  eventId: string,
): Promise<{ claimed: boolean; duplicate: boolean }> {
  const { error } = await supabase.from("webhook_events").insert({ event_id: eventId });

  if (!error) return { claimed: true, duplicate: false };

  // 23505 = unique_violation — the event id is already in the table.
  if (error.code === "23505") {
    console.log(`[Webhook] duplicate event ${eventId} — already processed`);
    return { claimed: false, duplicate: true };
  }

  // The table may not exist yet. Losing a payment is worse than losing
  // idempotency, so the event is still processed (NFR-2.4).
  console.error(
    "[Webhook] could not claim the event id — is the webhook_events table missing? " +
      "Run supabase/migrations/20261101000000_billing_webhook_events.sql",
    error.message,
  );
  return { claimed: true, duplicate: false };
}

export async function POST(request: Request) {
  // Raw bytes are required for signature verification — never parse first
  // (SEC-3.1).
  const rawBody = await request.text();

  // The signing secret is server-only and lives in exactly this file
  // (SEC-6.1 / SEC-6.5).
  const secret =
    process.env.DODO_WEBHOOK_SECRET?.trim() || process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();

  if (!secret) {
    console.error(
      "[Webhook] DODO_WEBHOOK_SECRET is not configured — rejecting the delivery",
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await new Webhook(secret).verify(rawBody, {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    });
  } catch (error) {
    console.error("[Webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    console.error("[Webhook] the body is not valid JSON");
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const eventType = typeof payload.type === "string" ? payload.type : "";
    const data = (payload.data ?? {}) as Record<string, unknown>;
    const customer = (data.customer ?? {}) as Record<string, unknown>;
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;

    const supabase = await getClient();

    // Idempotency: claim the event before doing any work (SEC-3.4).
    const eventId = resolveEventId(payload, request.headers.get("webhook-id"), rawBody);
    const { duplicate } = await claimEvent(supabase, eventId);
    if (duplicate) {
      return NextResponse.json({ received: true });
    }

    const appUserId = typeof metadata.app_user_id === "string" ? metadata.app_user_id : null;
    const rawEmail =
      typeof customer.email === "string"
        ? customer.email
        : typeof data.customer_email === "string"
          ? data.customer_email
          : null;
    const email = rawEmail?.trim().toLowerCase() ?? null;
    const subscriptionId =
      typeof data.subscription_id === "string"
        ? data.subscription_id
        : typeof data.id === "string" && eventType.startsWith("subscription")
          ? data.id
          : null;
    const customerId =
      typeof data.customer_id === "string"
        ? data.customer_id
        : typeof customer.customer_id === "string"
          ? customer.customer_id
          : null;

    if (ACTIVATING_EVENTS.has(eventType)) {
      if (!email && !appUserId && !subscriptionId) {
        console.error(
          "[Webhook] the event carried no customer email, user id or subscription id",
          eventType,
        );
        return NextResponse.json({ received: true });
      }

      const patch: Record<string, string> = { subscription_status: "active" };
      if (subscriptionId) patch.dodo_subscription_id = subscriptionId;
      if (customerId) patch.dodo_customer_id = customerId;

      const { matched, error } = await updateProfile(supabase, patch, {
        appUserId,
        email,
        subscriptionId,
      });

      // The billing-columns migration may not be applied yet. Retry with just
      // the status so the payment is never lost to a missing column.
      if (error?.code === "PGRST204") {
        console.error(
          "[Webhook] billing columns missing, retrying with the status only. " +
            "Run supabase/migrations/20261101000000_billing_webhook_events.sql",
          error.message,
        );
        const retry = await updateProfile(supabase, { subscription_status: "active" }, {
          appUserId,
          email,
          subscriptionId,
        });
        if (retry.error) {
          console.error("[Webhook] profile update failed", retry.error);
          return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
        }
        if (!retry.matched) {
          console.error("[Webhook] no profile found for the customer email", email);
          return NextResponse.json({ received: true });
        }
        console.log(`[Webhook] ${eventType} → active`);
        return NextResponse.json({ received: true });
      }

      if (error) {
        console.error("[Webhook] profile update failed", error);
        return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
      }

      if (!matched) {
        console.error("[Webhook] no profile found for the customer email", email);
        return NextResponse.json({ received: true });
      }

      console.log(`[Webhook] ${eventType} → active`);
      return NextResponse.json({ received: true });
    }

    if (CANCELED_EVENTS.has(eventType)) {
      if (!subscriptionId && !email && !appUserId) {
        console.error("[Webhook] the cancellation carried no subscription id");
        return NextResponse.json({ received: true });
      }

      // Cancelling at the end of the period keeps access until the period is
      // over — Dodo sends subscription.expired when it really ends. Revoking
      // here would take the customer's plan away days early (INT-4.7).
      const cancelAtPeriodEnd =
        eventType === "subscription.cancelled" && data.cancel_at_next_billing_date === true;
      if (cancelAtPeriodEnd) {
        console.log(
          `[Webhook] ${eventType} → cancels at the end of the period, access is kept until ${String(
            data.next_billing_date ?? "the next billing date",
          )}`,
        );
        return NextResponse.json({ received: true });
      }

      const { matched, error } = await updateProfile(
        supabase,
        { subscription_status: "canceled" },
        { appUserId, email, subscriptionId },
      );
      if (error) {
        console.error("[Webhook] profile update failed", error);
        return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
      }
      console.log(`[Webhook] ${eventType} → canceled (matched=${matched})`);
      return NextResponse.json({ received: true });
    }

    // A renewal charge failed but Dodo is still retrying it. Access is kept
    // during the grace window; the dashboard asks the customer to fix the card.
    if (eventType === "subscription.on_hold") {
      if (!subscriptionId && !email && !appUserId) {
        return NextResponse.json({ received: true });
      }
      const { matched, error } = await updateProfile(
        supabase,
        { subscription_status: "on_hold" },
        { appUserId, email, subscriptionId },
      );
      if (error) {
        console.error("[Webhook] profile update failed", error);
        return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
      }
      console.log(`[Webhook] ${eventType} → on_hold (matched=${matched})`);
      return NextResponse.json({ received: true });
    }

    // The initial mandate or the last retry failed — the subscription is dead.
    if (eventType === "subscription.failed") {
      if (!subscriptionId && !email && !appUserId) {
        return NextResponse.json({ received: true });
      }
      const { matched, error } = await updateProfile(
        supabase,
        { subscription_status: "failed" },
        { appUserId, email, subscriptionId },
      );
      if (error) {
        console.error("[Webhook] profile update failed", error);
        return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
      }
      console.log(`[Webhook] ${eventType} → failed (matched=${matched})`);
      return NextResponse.json({ received: true });
    }

    // Plan changes keep the subscription alive, so access is untouched.
    if (eventType === "subscription.plan_changed" || eventType === "subscription.updated") {
      console.log(`[Webhook] ${eventType} — access unchanged`);
      return NextResponse.json({ received: true });
    }

    console.error("[Webhook] unhandled event type", eventType);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] handler error", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
