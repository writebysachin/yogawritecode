import type { User } from "@supabase/supabase-js";

export type Plan = "free" | "starter" | "pro" | "scale";

export const FREE_PROJECT_LIMIT = 2;
export const TRIAL_DAYS = 7;

// Credit allocations — competitors gate by seats/documents; we gate by outcome.
export const FREE_CREDITS = 50;
export const STARTER_CREDITS = 200;
export const CARD_BONUS_CREDITS = 100;
export const REFERRAL_FREE_MONTHS_CAP = 3;

/** Subscription statuses that grant Pro access. Written by the billing webhooks. */
const PRO_STATUSES = ["active", "trialing"] as const;

export type PlanStatus = {
  plan: Plan;
  isPro: boolean;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  daysLeftInTrial: number;
  projectLimit: number;
  canExport: boolean;
  canCreateProject: boolean;
};

/**
 * Single source of truth for the user's plan.
 *
 * Pro access comes from `profiles.subscription_status`, which the Dodo
 * webhook sets to "active" after payment. Never read plan state from
 * `user_metadata` — nothing writes it there, so paid users would look free.
 */
export function getPlanStatus(
  user: User | null,
  projectCount: number,
  subscriptionStatus?: string | null,
): PlanStatus {
  const isPaidPro =
    subscriptionStatus != null &&
    (PRO_STATUSES as readonly string[]).includes(subscriptionStatus);
  const trialEnd = user?.user_metadata?.trial_end
    ? new Date(user.user_metadata.trial_end as string)
    : null;

  const now = new Date();
  const isTrialActive = !isPaidPro && trialEnd !== null && trialEnd > now;
  const daysLeftInTrial =
    isTrialActive && trialEnd
      ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000))
      : 0;

  const effectiveIsPro = isPaidPro || isTrialActive;

  return {
    plan: effectiveIsPro ? "pro" : "free",
    isPro: effectiveIsPro,
    isTrialActive,
    trialEndsAt: trialEnd,
    daysLeftInTrial,
    projectLimit: effectiveIsPro ? Infinity : FREE_PROJECT_LIMIT,
    canExport: effectiveIsPro,
    canCreateProject: effectiveIsPro || projectCount < FREE_PROJECT_LIMIT,
  };
}
