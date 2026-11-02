import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PageHeader } from "@/components/page-header";
import { isProSubscription } from "@/lib/plan";
import type { Subscription } from "@/lib/billing/subscription";

const PRO_FEATURES = [
  "Unlimited AI credits",
  "Unlimited projects",
  "Export to Markdown, PDF & Word",
  "Priority AI processing",
  "Cancel anytime",
] as const;

const FREE_LIMIT_MESSAGE =
  "You've hit the free plan limit of 1 project. Upgrade to Pro to create more projects and unlock every feature.";

/**
 * The upgrade card.
 *
 * Presentational only — the server component hands it the subscription and the
 * public payment link, and it renders the right state from that.
 */
export function UpgradePanel({
  subscription,
  paymentLink,
  error,
}: {
  subscription: Subscription;
  paymentLink: string | null;
  error?: string;
}) {
  const isPro = isProSubscription(subscription.subscription_status);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Upgrade to Pro"
        description="One plan, everything unlocked. Cancel whenever you like."
      />

      {error === "free-limit" ? (
        <p className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-4 py-2.5 text-sm font-medium text-[#B91C1C]">
          {FREE_LIMIT_MESSAGE}
        </p>
      ) : null}

      <div className="mt-8 max-w-md">
        <div className="relative rounded-xl border border-line bg-white p-6 shadow-pop">
          <span className="absolute -top-3 left-6 rounded-full bg-[#7C3AED] px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-white">
            MOST POPULAR
          </span>

          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#111827]">Pro</p>
              <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">
                For serious content teams
              </p>
            </div>
            <p className="text-right">
              <span className="font-sans text-3xl font-semibold tracking-tight text-[#111827]">
                $19
              </span>
              <span className="text-sm text-[#4B5563]"> / month</span>
            </p>
          </div>

          <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-[#4B5563]">
                <Check size={16} className="mt-0.5 shrink-0 text-[#15803D]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-line pt-5">
            {isPro ? (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-[#DCFCE7] px-6 py-3 text-sm font-semibold text-[#15803D]">
                <Check size={16} />
                Current plan
              </div>
            ) : (
              <CheckoutButton paymentLink={paymentLink} />
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#9CA3AF]">
          Secure payments powered by Dodo Payments. You have {subscription.ai_credits} AI credits
          left on your current plan.
        </p>
      </div>
    </div>
  );
}
