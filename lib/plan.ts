import type { User } from "@supabase/supabase-js";
import type { BillingCycle, PaidPlanId } from "@/lib/dodo";

export type Plan = "free" | "starter" | "pro" | "scale";

export const FREE_PROJECT_LIMIT = 2;
export const TRIAL_DAYS = 7;

// Credit allocations — competitors gate by seats/documents; we gate by outcome.
export const FREE_CREDITS = 50;
export const STARTER_CREDITS = 200;
export const CARD_BONUS_CREDITS = 100;
export const REFERRAL_FREE_MONTHS_CAP = 3;

/**
 * Subscription statuses that grant Pro access.
 *
 * `active` and `trialing` are the happy path. `on_hold` means a renewal
 * charge failed but Dodo is still retrying it (up to 13 days by default), so
 * access is kept during that grace window — Dodo moves the subscription to
 * `failed` once the retries are exhausted, and that does revoke access.
 */
const PRO_STATUSES = ["active", "trialing", "on_hold"] as const;

export type PlanStatus = {
  plan: Plan;
  isPro: boolean;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  daysLeftInTrial: number;
  projectLimit: number;
  canExport: boolean;
  canCreateProject: boolean;
  /** The paid plan the user picked during onboarding, if any. */
  trialPlan: PaidPlanId | null;
  /** The billing cycle the user picked during onboarding. */
  trialCycle: BillingCycle | null;
  /**
   * The trial ran out and was never turned into a subscription. The dashboard
   * uses this to offer the one-click upgrade that completes the conversion.
   */
  trialExpired: boolean;
  /** A renewal charge failed and Dodo is retrying it. */
  paymentFailed: boolean;
};

export type TrialState = {
  plan: PaidPlanId | null;
  cycle: BillingCycle | null;
  endsAt: Date | null;
  isActive: boolean;
  /** The trial ran out and the account never became a subscriber. */
  expired: boolean;
  daysLeft: number;
};

function readTrial(user: User | null): TrialState {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const rawEnd = typeof meta.trial_end === "string" ? meta.trial_end : null;
  const parsed = rawEnd ? new Date(rawEnd) : null;
  const endsAt = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;

  const rawPlan = meta.trial_plan;
  const plan =
    rawPlan === "starter" || rawPlan === "pro" || rawPlan === "scale"
      ? (rawPlan as PaidPlanId)
      : null;
  const rawCycle = meta.trial_cycle;
  const cycle: BillingCycle | null =
    rawCycle === "yearly" ? "yearly" : rawCycle === "monthly" ? "monthly" : null;

  const now = new Date();
  const isActive = endsAt !== null && endsAt > now;
  const daysLeft =
    isActive && endsAt
      ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86400000))
      : 0;

  return { plan, cycle, endsAt, isActive, expired: false, daysLeft };
}

/**
 * Reads the trial recorded in auth metadata during onboarding.
 *
 * `hasEverSubscribed` comes from profiles.dodo_subscription_id, which is only
 * written once a real Dodo subscription exists. It separates "your trial
 * ended, go and pay" from "you were a paying customer and later lapsed" —
 * the latter must never be nudged to re-activate a trial plan.
 */
export function getTrialState(user: User | null, hasEverSubscribed = false): TrialState {
  const state = readTrial(user);
  return {
    ...state,
    expired: !state.isActive && state.endsAt !== null && !hasEverSubscribed,
  };
}

/**
 * Single source of truth for the user's plan.
 *
 * Paid access comes from `profiles.subscription_status`, which the Dodo
 * webhook sets to "active" after payment. The no-card trial chosen during
 * onboarding sets `trial_end` in auth metadata, so a trial is Pro access
 * until that date passes. A real subscription always wins over a trial.
 */
export function getPlanStatus(
  user: User | null,
  projectCount: number,
  subscriptionStatus?: string | null,
  options?: { hasEverSubscribed?: boolean },
): PlanStatus {
  const isPaidPro =
    subscriptionStatus != null &&
    (PRO_STATUSES as readonly string[]).includes(subscriptionStatus);
  const everSubscribed = isPaidPro || options?.hasEverSubscribed === true;
  const trial = getTrialState(user, everSubscribed);

  const isTrialActive = !isPaidPro && trial.isActive;
  const daysLeftInTrial = isTrialActive ? trial.daysLeft : 0;
  const effectiveIsPro = isPaidPro || isTrialActive;

  return {
    plan: effectiveIsPro ? "pro" : "free",
    isPro: effectiveIsPro,
    isTrialActive,
    trialEndsAt: trial.endsAt,
    daysLeftInTrial,
    projectLimit: effectiveIsPro ? Infinity : FREE_PROJECT_LIMIT,
    canExport: effectiveIsPro,
    canCreateProject: effectiveIsPro || projectCount < FREE_PROJECT_LIMIT,
    trialPlan: trial.plan,
    trialCycle: trial.cycle,
    trialExpired: !isPaidPro && trial.expired,
    paymentFailed: subscriptionStatus === "on_hold",
  };
}
