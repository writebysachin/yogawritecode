import type { User } from "@supabase/supabase-js";
import { getPlanStatus } from "@/lib/plan";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const CREDIT_COST_PER_STEP = 1;

export const OUT_OF_CREDITS_MESSAGE =
  "You're out of credits. Claim 100 free credits with a card check, refer a founder for a free month, or upgrade to Starter ($9). Your saved steps are kept.";

export const OUT_OF_CREDITS_SHORT =
  "Out of credits — top up from the credits button or upgrade to keep going.";

type Reserve =
  | { ok: true; charged: boolean }
  | { ok: false };

/**
 * Reserve 1 credit for an AI step. Paid and trial users skip the ledger.
 * Call refundCredit() when the AI call fails so failed runs are never charged.
 * Fails open (allows the step) when the credits migration hasn't been applied,
 * so older databases never block the workflow.
 */
export async function reserveCredit(supabase: ServerClient, user: User): Promise<Reserve> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, ai_credits_balance")
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as {
    subscription_status?: string | null;
    ai_credits_balance?: number | null;
  } | null;

  if (getPlanStatus(user, 0, row?.subscription_status).isPro) {
    return { ok: true, charged: false };
  }

  // Column missing (migration not applied) — fail open, log once server-side.
  if (row && !("ai_credits_balance" in row)) {
    console.error("[credits] ai_credits_balance column missing; allowing step. Run supabase/migrations/20261013000000_profiles_credits_referrals.sql");
    return { ok: true, charged: false };
  }

  const balance = row?.ai_credits_balance ?? 50;
  if (balance < CREDIT_COST_PER_STEP) return { ok: false };

  const { error } = await supabase
    .from("profiles")
    .update({ ai_credits_balance: balance - CREDIT_COST_PER_STEP })
    .eq("id", user.id);

  if (error) {
    console.error("[credits] reserve failed", error);
    // Fail open on ledger errors — never block the workflow on bookkeeping.
    return { ok: true, charged: false };
  }
  return { ok: true, charged: true };
}

export async function refundCredit(supabase: ServerClient, userId: string): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_credits_balance")
    .eq("id", userId)
    .maybeSingle();

  const row = profile as { ai_credits_balance?: number | null } | null;
  if (!row || !("ai_credits_balance" in row)) return;

  const { error } = await supabase
    .from("profiles")
    .update({ ai_credits_balance: (row.ai_credits_balance ?? 0) + CREDIT_COST_PER_STEP })
    .eq("id", userId);

  if (error) console.error("[credits] refund failed", error);
}
