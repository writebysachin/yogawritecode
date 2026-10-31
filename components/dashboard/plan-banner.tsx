import Link from "next/link";
import { PLAN_NAMES, type PaidPlanId } from "@/lib/dodo";
import type { PlanStatus } from "@/lib/plan";

function activateHref(plan: PaidPlanId, cycle: string | null): string {
  const params = new URLSearchParams({ plan, cycle: cycle === "yearly" ? "yearly" : "monthly" });
  return `/dashboard/pricing?${params.toString()}&activate=1`;
}

export function PlanBanner({ planStatus }: { planStatus: PlanStatus }) {
  // A renewal charge failed but Dodo is still retrying — keep access, but say
  // so and point at the billing page instead of silently keeping Pro.
  if (planStatus.paymentFailed) {
    return (
      <div className="mb-6 rounded-card border border-warning bg-warning-soft px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">We couldn&apos;t take your last payment</p>
            <p className="mt-0.5 text-xs text-ink-secondary">
              Your plan is paused until the payment goes through. Update your card to keep your
              credits and exports.
            </p>
          </div>
          <Link
            href="/dashboard/pricing"
            className="rounded-control bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            Fix payment
          </Link>
        </div>
      </div>
    );
  }

  // The trial ran out and never became a subscription. This is the conversion
  // moment: one click to the plan they already chose, then checkout.
  if (planStatus.trialExpired && planStatus.trialPlan) {
    const name = PLAN_NAMES[planStatus.trialPlan];
    const cycle = planStatus.trialCycle === "yearly" ? "yearly" : "monthly";
    return (
      <div className="mb-6 rounded-card border border-brand bg-brand-soft/40 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Your {name} trial has ended</p>
            <p className="mt-0.5 text-xs text-ink-secondary">
              Activate {name} ({cycle}) to keep unlimited credits, exports and priority processing.
            </p>
          </div>
          <Link
            href={activateHref(planStatus.trialPlan, planStatus.trialCycle)}
            className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover"
          >
            Activate {name}
          </Link>
        </div>
      </div>
    );
  }

  if (planStatus.isPro && !planStatus.isTrialActive) return null;

  if (planStatus.isTrialActive) {
    const plan = planStatus.trialPlan;
    return (
      <div className="mb-6 rounded-card border border-brand-soft bg-brand-soft/30 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">
              Trial active — {planStatus.daysLeftInTrial} day{planStatus.daysLeftInTrial !== 1 ? "s" : ""} left
            </p>
            <p className="mt-0.5 text-xs text-ink-secondary">
              {plan
                ? `Your ${PLAN_NAMES[plan]} trial ends soon — activate it now to keep Pro features.`
                : "Upgrade before your trial ends to keep Pro features."}
            </p>
          </div>
          <Link
            href={plan ? activateHref(plan, planStatus.trialCycle) : "/dashboard/pricing"}
            className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover"
          >
            {plan ? `Activate ${PLAN_NAMES[plan]}` : "Upgrade now"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-card border border-line bg-surface-subtle px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Free plan</p>
          <p className="mt-0.5 text-xs text-ink-secondary">
            50 credits · No card required · Upgrade anytime for more projects and exports.
          </p>
        </div>
        <Link
          href="/dashboard/pricing"
          className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          See plans
        </Link>
      </div>
    </div>
  );
}
