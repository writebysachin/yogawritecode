import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import {
  PLAN_NAMES,
  PLAN_PRICES,
  buildDodoPlanLink,
  normalizeCycle,
  normalizePlan,
  type PaidPlanId,
} from "@/lib/dodo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your plan and continue to secure checkout.",
  robots: { index: false, follow: false },
};

const PLAN_BLURBS: Record<PaidPlanId, string> = {
  starter: "For solo bloggers starting a content pipeline.",
  pro: "For serious writers scaling output.",
  scale: "For agencies and teams shipping client work.",
};

const PLAN_FEATURES: Record<PaidPlanId, string[]> = {
  starter: ["200 AI credits / month", "3 active projects", "Export to Markdown + PDF"],
  pro: ["Unlimited AI credits", "Unlimited projects", "Export to Markdown, PDF, Word", "Priority AI processing"],
  scale: ["Everything in Pro", "Client-ready exports", "Bulk briefs + outlines", "Dedicated support"],
};

const PLANS: PaidPlanId[] = ["starter", "pro", "scale"];

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const plan = normalizePlan(params.plan);
  const cycle = normalizeCycle(params.cycle);

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ?? undefined;
  const userId = userData.user?.id ?? undefined;
  const authed = Boolean(userData.user);

  const price = cycle === "yearly" ? PLAN_PRICES[plan].yearly : PLAN_PRICES[plan].monthly;
  const unit = cycle === "yearly" ? "/ year" : "/ month";
  const dodoHref = authed ? buildDodoPlanLink(plan, email, userId, cycle) : null;
  const signupHref = `/signup?plan=${plan}&cycle=${cycle}`;

  return (
    <main className="bg-canvas">
      <div className="mx-auto max-w-[960px] px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <span aria-hidden="true"> / </span>
          Checkout
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">
          Review and check out
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-ink-secondary">
          Three steps: pick a plan, {authed ? "confirm and pay" : "create your account"}, then land
          back in your dashboard. 7-day free trial, no charge today.
        </p>

        {/* Steps */}
        <ol className="mt-6 flex flex-wrap gap-2 text-sm">
          <li className="rounded-full bg-green-100 px-3 py-1.5 font-medium text-green-700">✓ 1 Select plan</li>
          <li
            className={`rounded-full px-3 py-1.5 font-medium ${
              authed ? "bg-green-100 text-green-700" : "bg-ink text-white"
            }`}
          >
            {authed ? "✓" : "○"} 2 {authed ? "Signed in" : "Create account"}
          </li>
          <li className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-600">
            ○ 3 Secure payment
          </li>
        </ol>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: plan + cycle selection */}
          <div className="rounded-card border border-line bg-surface p-6 sm:p-7">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
              1 · Choose plan
            </h2>
            <div className="mt-4 grid gap-3">
              {PLANS.map((p) => {
                const active = p === plan;
                return (
                  <Link
                    key={p}
                    href={`/checkout?plan=${p}&cycle=${cycle}`}
                    aria-current={active ? "true" : undefined}
                    className={`flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${
                      active
                        ? "border-brand bg-brand-soft/30 ring-1 ring-brand"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {PLAN_NAMES[p]}
                        {p === "pro" ? (
                          <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                            Most popular
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-secondary">
                        {PLAN_BLURBS[p]}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-sans text-xl font-semibold text-ink">
                        {cycle === "yearly" ? PLAN_PRICES[p].yearly : PLAN_PRICES[p].monthly}
                      </span>
                      <span className="block text-xs text-ink-muted">{unit}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <h2 className="mt-7 text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
              2 · Billing period
            </h2>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-line bg-surface-subtle p-1">
              <Link
                href={`/checkout?plan=${plan}&cycle=monthly`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  cycle === "monthly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
                }`}
              >
                Monthly
              </Link>
              <Link
                href={`/checkout?plan=${plan}&cycle=yearly`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  cycle === "yearly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
                }`}
              >
                Yearly
                <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                  Save 20%
                </span>
              </Link>
            </div>
          </div>

          {/* Right: order summary */}
          <aside className="h-fit rounded-card border-2 border-brand bg-surface p-6 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
              Order summary
            </p>
            <p className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">
              {PLAN_NAMES[plan]}
            </p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-sans text-4xl font-semibold tracking-tight text-ink">{price}</span>
              <span className="text-sm text-ink-muted">{unit}</span>
            </p>
            <p className="mt-1 text-xs font-medium text-success">7-day free trial · no card charge today</p>

            <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
              {PLAN_FEATURES[plan].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                  <Check size={16} className="mt-0.5 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {authed ? (
                <a
                  href={dodoHref ?? "#"}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
                >
                  Continue to secure checkout
                  <ArrowRight size={16} />
                </a>
              ) : (
                <Link
                  href={signupHref}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
                >
                  Create account to continue
                  <ArrowRight size={16} />
                </Link>
              )}
              {!authed ? (
                <p className="mt-2 text-center text-xs text-ink-muted">
                  Already have an account?{" "}
                  <Link
                    href={`/login?plan=${plan}&cycle=${cycle}`}
                    className="font-medium text-ink underline underline-offset-4"
                  >
                    Log in
                  </Link>
                </p>
              ) : null}
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-ink-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" />
              Secure payments powered by Dodo Payments. Cancel anytime. You return to
              /dashboard/payment-success after payment.
            </p>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs text-ink-muted">
          <p>
            By subscribing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/refund-policy" className="underline underline-offset-4 hover:text-ink">
              Refund Policy
            </Link>
            .
          </p>
          <Link href="/pricing" className="font-medium text-ink-secondary hover:text-ink">
            ← Back to pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
