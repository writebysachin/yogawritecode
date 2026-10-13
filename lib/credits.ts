import type { User } from "@supabase/supabase-js";
import { isMockAIMode } from "@/lib/ai/provider";
import { getPlanStatus } from "@/lib/plan";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const CREDIT_COST_PER_STEP = 1;

export const OUT_OF_CREDITS_MESSAGE =
  "You're out of credits. Claim 100 free credits with a card check, refer a founder for a free month, or upgrade to Starter ($9). Your saved steps are kept.";

export const OUT_OF_CREDITS_SHORT =
  "Out of credits — top up from the credits button or upgrade to keep going.";

export type CreditStep =
  | "analysis"
  | "cluster"
  | "brief"
  | "outline"
  | "section-draft"
  | "section-improve";

/** Which model served the step — recorded on every ledger row. */
export function currentModelLabel(): string {
  if (isMockAIMode()) return "mock";
  return process.env.BEDROCK_MODEL_ID ?? "bedrock";
}

type Reserve = { ok: true; charged: boolean } | { ok: false };

async function logLedger(
  supabase: ServerClient,
  userId: string,
  entry: {
    delta: number;
    balanceAfter: number | null;
    reason: string;
    step?: CreditStep;
    model?: string;
  },
): Promise<void> {
  const { error } = await supabase.from("credit_ledger").insert({
    user_id: userId,
    delta: entry.delta,
    balance_after: entry.balanceAfter,
    reason: entry.reason,
    step: entry.step ?? null,
    model: entry.model ?? currentModelLabel(),
  });
  // Ledger is observability, never load-bearing — fail open when the table
  // or migration is missing so the workflow never blocks on bookkeeping.
  if (error) console.error("[credits] ledger insert failed", error.message);
}

/**
 * Reserve 1 credit for an AI step. Paid and trial users skip the ledger.
 * Call refundCredit() when the AI call fails so failed runs are never charged.
 * Fails open (allows the step) when the credits migration hasn't been applied,
 * so older databases never block the workflow.
 */
export async function reserveCredit(
  supabase: ServerClient,
  user: User,
  step: CreditStep,
): Promise<Reserve> {
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

  const next = balance - CREDIT_COST_PER_STEP;
  const { error } = await supabase
    .from("profiles")
    .update({ ai_credits_balance: next })
    .eq("id", user.id);

  if (error) {
    console.error("[credits] reserve failed", error);
    // Fail open on ledger errors — never block the workflow on bookkeeping.
    return { ok: true, charged: false };
  }
  await logLedger(supabase, user.id, {
    delta: -CREDIT_COST_PER_STEP,
    balanceAfter: next,
    reason: "step",
    step,
  });
  return { ok: true, charged: true };
}

export async function refundCredit(
  supabase: ServerClient,
  userId: string,
  step?: CreditStep,
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_credits_balance")
    .eq("id", userId)
    .maybeSingle();

  const row = profile as { ai_credits_balance?: number | null } | null;
  if (!row || !("ai_credits_balance" in row)) return;

  const next = (row.ai_credits_balance ?? 0) + CREDIT_COST_PER_STEP;
  const { error } = await supabase
    .from("profiles")
    .update({ ai_credits_balance: next })
    .eq("id", userId);

  if (error) {
    console.error("[credits] refund failed", error);
    return;
  }
  await logLedger(supabase, userId, {
    delta: CREDIT_COST_PER_STEP,
    balanceAfter: next,
    reason: "refund",
    step,
  });
}

export async function logClaim(
  supabase: ServerClient,
  userId: string,
  amount: number,
  balanceAfter: number,
): Promise<void> {
  await logLedger(supabase, userId, {
    delta: amount,
    balanceAfter,
    reason: "claim",
  });
}
