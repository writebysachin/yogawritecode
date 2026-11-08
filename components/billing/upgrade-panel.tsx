import { Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { isProSubscription } from "@/lib/plan";
import type { Subscription } from "@/lib/billing/subscription";
import type { BillingCycle, PaidPlanId } from "@/lib/dodo";
import {
  CheckoutButton,
  CheckoutFrame,
  CheckoutProvider,
  PromoCodeInput,
} from "@/components/marketing/checkout-flow";

const PLAN_FEATURES: Record<PaidPlanId, string[]> = {
  starter: [
    "200 AI credits / month",
    "3 active projects",
    "Export to Markdown + PDF",
    "Cancel anytime",
  ],
  pro: [
    "Unlimited AI credits",
    "Unlimited projects",
    "Export to Markdown, PDF & Word",
    "Priority AI processing",
    "Cancel anytime",
  ],
  scale: [
    "Everything in Pro",
    "Client-ready exports",
    "Bulk briefs + outlines",
    "Dedicated support",
    "Cancel anytime",
  ],
};

const PLAN_PRICES: Record<PaidPlanId, { monthly: string; yearly: string }> = {
  starter: { monthly: "$9", yearly: "$86" },
  pro: { monthly: "$19", yearly: "$182" },
  scale: { monthly: "$40", yearly: "$384" },
};

const PLAN_NAMES: Record<PaidPlanId, string> = {
  starter: "Starter",
  pro: "Pro Writer",
  scale: "Scale",
};

const FREE_LIMIT_MESSAGE =
  "You've hit the free plan limit of 1 project. Upgrade to unlock more projects and every feature.";

export function UpgradePanel({
  subscription,
  error,
  plan,
  cycle,
  autoStart = false,
}: {
  subscription: Subscription;
  error?: string;
  plan: PaidPlanId;
  cycle: BillingCycle;
  autoStart?: boolean;
}) {
  const isPro = isProSubscription(subscription.subscription_status);
  const features = PLAN_FEATURES[plan];
  const price = cycle === "yearly" ? PLAN_PRICES[plan].yearly : PLAN_PRICES[plan].monthly;
  const unit = cycle === "yearly" ? "/ year" : "/ month";
  const planName = PLAN_NAMES[plan];

  return (
    <CheckoutProvider plan={plan} cycle={cycle} autoStart={!isPro && autoStart}>
      <div className="min-w-0">
        <PageHeader
          title={`Upgrade to ${planName}`}
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
              {plan === "pro" ? "MOST POPULAR" : planName.toUpperCase()}
            </span>

            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-lg font-semibold tracking-tight text-[#111827]">{planName}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">
                  {cycle === "yearly" ? "Billed yearly" : "Billed monthly"}
                </p>
              </div>
              <p className="text-right">
                <span className="font-sans text-3xl font-semibold tracking-tight text-[#111827]">
                  {price}
                </span>
                <span className="text-sm text-[#4B5563]"> {unit}</span>
              </p>
            </div>

            <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
              {features.map((feature) => (
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
                <>
                  <PromoCodeInput />
                  <div className="mt-4">
                    <CheckoutButton>
                      Pay securely — start {planName}
                    </CheckoutButton>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-[#9CA3AF]">
            Secure payments by Dodo Payments. You have {subscription.ai_credits} AI credits left.
          </p>
        </div>

        {!isPro ? (
          <CheckoutFrame planName={planName} price={price} unit={unit} />
        ) : null}
      </div>
    </CheckoutProvider>
  );
}
