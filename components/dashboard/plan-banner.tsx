import Link from "next/link";
import type { PlanStatus } from "@/lib/plan";

export function PlanBanner({ planStatus }: { planStatus: PlanStatus }) {
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

  if (planStatus.isPro) return null;

  return (
    <div className="mb-6 rounded-card border border-line bg-surface-subtle px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Free plan</p>
          <p className="mt-0.5 text-xs text-ink-secondary">
            50 credits · No card required · Upgrade anytime for unlimited credits, more projects, and exports.
          </p>
        </div>
        <Link
          href="/dashboard/pricing"
          className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
