import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";
import { planForProduct } from "@/lib/dodo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
 * Updates the profile behind a Dodo event.
 *
 * The stable app user id from checkout metadata is preferred. The email is the
 * fallback so a checkout without metadata still lands on the right account, and
 * the subscription id is the last resort for lifecycle events that carry no
 * customer metadata at all.
 */
async function updateProfile(
  supabase: SupabaseClient,
  patch: Record<string, string>,
  selector: Selector,
): Promise<ProfilePatchResult> {
  let lastError: { code?: string; message: string } | null = null;

  if (selector.appUserId) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", selector.appUserId)
      .select("id");
    if (error) lastError = error;
    else if ((data ?? []).length > 0) return { matched: true, error: null };
  }

  if (selector.email) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .ilike("email", selector.email)
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

export async function POST(request: Request) {
  // Raw bytes are required for signature verification — never parse first.
  const rawBody = await request.text();

  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (webhookKey) {
    try {
      await new Webhook(webhookKey).verify(rawBody, {
        "webhook-id": request.headers.get("webhook-id") ?? "",
        "webhook-signature": request.headers.get("webhook-signature") ?? "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      });
    } catch {
      console.error("[dodo webhook] signature verification failed");
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  } else {
    console.error(
      "[dodo webhook] DODO_PAYMENTS_WEBHOOK_KEY is not configured; accepting unsigned payload. " +
        "Add the signing secret from Dodo Dashboard → Developer → Webhooks.",
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const eventType = typeof payload.type === "string" ? payload.type : "";
    const data = (payload.data ?? {}) as Record<string, unknown>;
    const customer = (data.customer ?? {}) as Record<string, unknown>;
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const appUserId =
      typeof metadata.app_user_id === "string" ? metadata.app_user_id : null;
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
    const productId = typeof data.product_id === "string" ? data.product_id : null;
    const plan = planForProduct(productId);

    const supabase = await getClient();

    // A payment landed (or a trial started): the account is a paying customer.
    const ACTIVATING_EVENTS = ["subscription.active", "subscription.renewed", "payment.succeeded"];

    if (ACTIVATING_EVENTS.includes(eventType)) {
      if (!email && !appUserId && !subscriptionId) {
        console.error("[dodo webhook] event had no customer email, user id or subscription id", eventType);
        return NextResponse.json({ received: true, handled: false });
      }
      const fullUpdate: Record<string, string> = { subscription_status: "active" };
      if (subscriptionId) fullUpdate.dodo_subscription_id = subscriptionId;
      if (customerId) fullUpdate.dodo_customer_id = customerId;

      const { matched, error } = await updateProfile(supabase, fullUpdate, {
        appUserId,
        email,
        subscriptionId,
      });

      // The billing-columns migration may not be applied yet. Retry with just
      // the status so the payment is never lost to a missing column.
      if (error?.code === "PGRST204") {
        console.error(
          "[dodo webhook] billing columns missing, retrying with status only. " +
            "Run supabase/migrations/20261006010000_profiles_dodo_columns.sql",
          error.message,
        );
        const retry = await updateProfile(supabase, { subscription_status: "active" }, {
          appUserId,
          email,
          subscriptionId,
        });
        if (retry.error) {
          console.error("[dodo webhook] profile update failed", retry.error);
          return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
        }
        if (!retry.matched) {
          console.error("[dodo webhook] no profile found for customer email", email);
          return NextResponse.json({ error: "No matching profile." }, { status: 404 });
        }
        return NextResponse.json({ received: true, handled: true });
      }

      if (error) {
        console.error("[dodo webhook] profile update failed", error);
        return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
      }
      if (!matched) {
        console.error("[dodo webhook] no profile found for customer email", email);
        return NextResponse.json({ error: "No matching profile." }, { status: 404 });
      }
      console.log(`[dodo webhook] ${eventType} → active (plan=${plan ?? "unknown"})`);
      return NextResponse.json({ received: true, handled: true });
    }

    // A renewal charge failed but Dodo is still retrying it. Access is kept
    // during the grace window; the dashboard asks the customer to fix the card.
    if (eventType === "subscription.on_hold") {
      if (!subscriptionId && !email && !appUserId) {
        return NextResponse.json({ received: true, handled: false });
      }
      const { matched } = await updateProfile(supabase, { subscription_status: "on_hold" }, {
        appUserId,
        email,
        subscriptionId,
      });
      console.log(`[dodo webhook] ${eventType} → on_hold (matched=${matched})`);
      return NextResponse.json({ received: true, handled: true });
    }

    // The initial mandate or the last retry failed — the subscription is dead.
    if (eventType === "subscription.failed") {
      if (!subscriptionId && !email && !appUserId) {
        return NextResponse.json({ received: true, handled: false });
      }
      const { matched } = await updateProfile(supabase, { subscription_status: "failed" }, {
        appUserId,
        email,
        subscriptionId,
      });
      console.log(`[dodo webhook] ${eventType} → failed (matched=${matched})`);
      return NextResponse.json({ received: true, handled: true });
    }

    if (eventType === "subscription.cancelled" || eventType === "subscription.expired") {
      if (!subscriptionId) {
        console.error("[dodo webhook] canceled event had no subscription id");
        return NextResponse.json({ received: true, handled: false });
      }

      // Cancelling at the end of the period keeps access until the period is
      // over — Dodo sends subscription.expired when it really ends. Revoking
      // here would take the customer's plan away days early.
      const cancelAtPeriodEnd =
        eventType === "subscription.cancelled" && data.cancel_at_next_billing_date === true;
      if (cancelAtPeriodEnd) {
        console.log(
          `[dodo webhook] ${eventType} → cancels at period end, access kept until ${String(
            data.next_billing_date ?? "the next billing date",
          )}`,
        );
        return NextResponse.json({ received: true, handled: true });
      }

      const { matched } = await updateProfile(supabase, { subscription_status: "canceled" }, {
        appUserId,
        email,
        subscriptionId,
      });
      console.log(`[dodo webhook] ${eventType} → canceled (matched=${matched})`);
      return NextResponse.json({ received: true, handled: true });
    }

    // Plan changes keep the subscription alive, so access is untouched.
    if (eventType === "subscription.plan_changed") {
      console.log(`[dodo webhook] ${eventType} (plan=${plan ?? "unknown"})`);
      return NextResponse.json({ received: true, handled: true });
    }

    console.error("[dodo webhook] unhandled event type", eventType);
    return NextResponse.json({ received: true, handled: false });
  } catch (error) {
    console.error("[dodo webhook] handler error", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
