import { getPlanStatus, isProSubscription } from "@/lib/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Billing state for the signed-in user.
 *
 * This module is server-only: it reads cookies through
 * `createSupabaseServerClient()`. Import it from a server component or a
 * server action, never from a `"use client"` component.
 */

/** The status a brand new (or profile-less) account sits on. */
export const FREE_TIER_STATUS = "free";

/** Credits granted to a free account that has never spent any. */
export const DEFAULT_AI_CREDITS = 50;

/**
 * `isProSubscription` — true when a `profiles.subscription_status` grants Pro
 * access. Re-exported from `lib/plan.ts` (the single source of truth) so
 * server code can reach it from one place.
 */
export { isProSubscription };

export type Subscription = {
  /** `profiles.subscription_status` — `free` when unknown. */
  subscription_status: string;
  /** Remaining AI credits. */
  ai_credits: number;
  /** The Dodo subscription id, once the user has paid. */
  dodo_subscription_id: string | null;
  /** The paid plan the user is currently on — `null` for free accounts. */
  current_plan: string | null;
};

const FREE_SUBSCRIPTION: Subscription = {
  subscription_status: FREE_TIER_STATUS,
  ai_credits: DEFAULT_AI_CREDITS,
  dodo_subscription_id: null,
  current_plan: null,
};

type ProfileRow = {
  subscription_status?: string | null;
  ai_credits?: number | null;
  ai_credits_balance?: number | null;
  dodo_customer_id?: string | null;
  dodo_subscription_id?: string | null;
  current_plan?: string | null;
};

/**
 * Column sets tried in order.
 *
 * `profiles` is migrated incrementally, so a column may not exist yet. Each
 * fallback drops the newest column until the query succeeds, which keeps the
 * dashboard working before (and after) the billing migration is applied.
 */
const PROFILE_SELECTS = [
  "subscription_status, ai_credits, ai_credits_balance, dodo_customer_id, dodo_subscription_id, current_plan",
  "subscription_status, ai_credits, ai_credits_balance, dodo_customer_id, dodo_subscription_id",
  "subscription_status, ai_credits_balance, dodo_customer_id, dodo_subscription_id",
  "subscription_status, ai_credits, dodo_subscription_id",
  "subscription_status, dodo_subscription_id",
] as const;

type SupabaseLike = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Reads the profile row, tolerating columns that have not been migrated yet.
 *
 * Returns `null` when the row is missing or the query fails — the caller then
 * treats the account as a free-tier account.
 */
async function readProfileRow(
  supabase: SupabaseLike,
  userId: string,
): Promise<ProfileRow | null> {
  let lastMessage = "";

  for (const columns of PROFILE_SELECTS) {
    const { data, error } = await supabase
      .from("profiles")
      .select(columns)
      .eq("id", userId)
      .maybeSingle();

    if (!error) return (data ?? null) as ProfileRow | null;

    lastMessage = error.message;
    // PGRST204 = "Could not find the column in the schema cache" — retry with
    // fewer columns. Any other error will not be fixed by retrying.
    if (error.code !== "PGRST204") {
      console.error("[billing] profile lookup failed", error.message);
      return null;
    }
  }

  console.error(
    "[billing] profile lookup failed — the billing columns are missing. " +
      "Run supabase/migrations/20261101000000_billing_webhook_events.sql",
    lastMessage,
  );
  return null;
}

function toFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Maps a profile row onto the public subscription shape.
 *
 * A missing row is a free tier, never an error (FR-6.9).
 */
function toSubscription(row: ProfileRow | null): Subscription {
  if (!row) return { ...FREE_SUBSCRIPTION };

  const status =
    typeof row.subscription_status === "string" && row.subscription_status.trim()
      ? row.subscription_status.trim()
      : FREE_TIER_STATUS;

  // `ai_credits_balance` is the column the credit ledger actually maintains;
  // `ai_credits` is the newer alias. Prefer the live balance, fall back to the
  // alias, then to the free-tier allowance.
  const credits =
    toFiniteNumber(row.ai_credits_balance) ??
    toFiniteNumber(row.ai_credits) ??
    DEFAULT_AI_CREDITS;

  const rawPlan = typeof row.current_plan === "string" ? row.current_plan.trim() : null;
  const currentPlan =
    rawPlan === "starter" || rawPlan === "pro" || rawPlan === "scale" ? rawPlan : null;

  return {
    subscription_status: status,
    ai_credits: credits,
    dodo_subscription_id:
      typeof row.dodo_subscription_id === "string" && row.dodo_subscription_id.trim()
        ? row.dodo_subscription_id.trim()
        : null,
    current_plan: currentPlan,
  };
}

/**
 * The current user's billing state.
 *
 * Null-safe: no signed-in user, no profile row or a failed lookup all resolve
 * to the free tier.
 */
export async function getSubscription(): Promise<Subscription> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return { ...FREE_SUBSCRIPTION };

  const row = await readProfileRow(supabase, user.id);
  return toSubscription(row);
}

/**
 * May this account create another project? (FR-6)
 *
 * A free-tier account that already owns at least one project is blocked and
 * must be sent to the upgrade page. Paid accounts and accounts with a live
 * trial are unlimited.
 *
 * The check lives on the server so it cannot be bypassed by hiding the UI
 * button — every project-creating server action calls this first.
 */
export async function canCreateProject(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return false;

  const subscription = toSubscription(await readProfileRow(supabase, user.id));

  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  if (error) {
    // Fail closed: without an accurate project count we cannot prove the user
    // is inside the free allowance.
    console.error("[billing] project count failed", error.message);
    return false;
  }

  const projectCount = count ?? 0;

  // `getPlanStatus` is the single source of truth for "is this account Pro"
  // and owns the free-tier project allowance.
  return getPlanStatus(user, projectCount, subscription.subscription_status)
    .canCreateProject;
}
