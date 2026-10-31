"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import type { BillingCycle } from "@/lib/dodo";

const FREE_FEATURES = [
  { label: "50 AI credits, no card required", included: true },
  { label: "2 active projects", included: true },
  { label: "Full 5-step workflow", included: true },
  { label: "View-only exports", included: false },
] as const;

const STARTER_FEATURES = [
  { label: "200 AI credits / month", included: true },
  { label: "3 active projects", included: true },
  { label: "Export to Markdown + PDF", included: true },
  { label: "Priority processing", included: false },
] as const;

const PRO_FEATURES = [
  { label: "Unlimited AI credits", included: true },
  { label: "Unlimited projects", included: true },
  { label: "Export to Markdown, PDF, Word", included: true },
  { label: "Priority AI processing", included: true },
] as const;

const SCALE_FEATURES = [
  { label: "Everything in Pro", included: true },
  { label: "Client-ready exports", included: true },
  { label: "Bulk briefs + outlines", included: true },
  { label: "Dedicated support", included: true },
] as const;

function FeatureList({ features }: { features: ReadonlyArray<{ label: string; included: boolean }> }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {features.map((feature) => (
        <li key={feature.label} className="flex items-start gap-2.5 text-sm">
          {feature.included ? (
            <Check size={16} className="mt-0.5 shrink-0 text-success" />
          ) : (
            <X size={16} className="mt-0.5 shrink-0 text-ink-muted" />
          )}
          <span className={feature.included ? "text-ink-secondary" : "text-ink-muted"}>
            {feature.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PricingPlans({
  isPro,
  email,
  userId,
  highlightPlan,
  hideFree,
  initialCycle,
  mode = "checkout",
}: {
  isPro: boolean;
  email?: string;
  userId?: string;
  highlightPlan?: string;
  hideFree?: boolean;
  initialCycle?: BillingCycle;
  mode?: "checkout" | "marketing";
}) {
  const [cycle, setCycle] = useState<BillingCycle>(initialCycle ?? "monthly");

  // Marketing traffic logs in (or signs up) first and picks a plan during
  // onboarding — no card is collected there. In-product upgrades still go to
  // the internal checkout, which starts the Dodo payment flow.
  const planHref = (plan: string) =>
    mode === "marketing"
      ? `/login?plan=${plan}&cycle=${cycle}`
      : `/checkout?plan=${plan}&cycle=${cycle}`;
  const freeHref = mode === "marketing" ? "/login" : "/signup";
  const selectLabel = (plan: string) =>
    mode === "marketing" ? "Get started" : `Select ${plan}`;
  const trialCopy =
    mode === "marketing" ? "7-day free trial · no card" : "7-day free trial · card required";

  const prices = {
    starter: cycle === "yearly" ? "$86" : "$9",
    pro: cycle === "yearly" ? "$182" : "$19",
    scale: cycle === "yearly" ? "$384" : "$40",
  };
  const unit = cycle === "yearly" ? "/ year" : "/ month";
  const ring = (plan: string) =>
    highlightPlan === plan ? " ring-2 ring-brand ring-offset-2" : "";

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              cycle === "monthly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              cycle === "yearly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
            }`}
          >
            Yearly
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className={`mt-10 grid gap-6 md:grid-cols-2 ${hideFree ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
        {hideFree ? null : (
          <section className="flex flex-col rounded-card border border-line bg-surface p-7">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">Free</p>
            <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">Try free</h2>
            <p className="mt-5 flex items-baseline gap-2">
              <span className="font-sans text-4xl font-semibold tracking-tight text-ink">$0</span>
              <span className="text-sm text-ink-muted">/ forever</span>
            </p>
            <p className="mt-1 text-xs font-medium text-success">No credit card required</p>
            <FeatureList features={FREE_FEATURES} />
            <div className="mt-8 pt-2">
              {isPro || email || userId ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 w-full cursor-default items-center justify-center rounded-field border border-line bg-surface text-sm font-medium text-ink-muted"
                >
                  Current Plan
                </button>
              ) : (
                <a
                  href={freeHref}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Start for free
                  <ArrowRight size={16} />
                </a>
              )}
            </div>
          </section>
        )}

        <section className={`flex flex-col rounded-card border border-line bg-surface p-7${ring("starter")}`}>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">Starter</p>
          <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">
            Solo bloggers
          </h2>
          <p className="mt-5 flex items-baseline gap-2">
            <span className="font-sans text-4xl font-semibold tracking-tight text-ink">
              {prices.starter}
            </span>
            <span className="text-sm text-ink-muted">{unit}</span>
          </p>
          <p className="mt-1 text-xs font-medium text-success">{trialCopy}</p>
          <FeatureList features={STARTER_FEATURES} />
          <div className="mt-8 pt-2">
            <a
              href={planHref("starter")}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field border border-line px-4 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              {selectLabel("Starter")}
              <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <section className={`relative flex flex-col rounded-card border-2 border-brand bg-surface p-7${ring("pro")}`}>
          <span className="absolute right-6 top-6 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            Most Popular
          </span>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">Pro Writer</p>
          <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">
            Scale your strategy
          </h2>
          <p className="mt-5 flex items-baseline gap-2">
            <span className="font-sans text-4xl font-semibold tracking-tight text-ink">
              {prices.pro}
            </span>
            <span className="text-sm text-ink-muted">{unit}</span>
          </p>
          <p className="mt-1 text-xs font-medium text-success">{trialCopy}</p>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            Everything in Starter, plus
          </p>
          <FeatureList features={PRO_FEATURES} />
          <div className="mt-8 pt-2">
            {isPro ? (
              <button
                type="button"
                disabled
                className="inline-flex h-11 w-full cursor-default items-center justify-center rounded-field border border-line bg-surface text-sm font-medium text-ink-muted"
              >
                Current Plan
              </button>
            ) : (
              <a
                href={planHref("pro")}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                {selectLabel("Pro")}
                <ArrowRight size={16} />
              </a>
            )}
          </div>
        </section>

        <section className={`flex flex-col rounded-card border border-line bg-surface p-7${ring("scale")}`}>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">Scale</p>
          <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">
            Agencies + teams
          </h2>
          <p className="mt-5 flex items-baseline gap-2">
            <span className="font-sans text-4xl font-semibold tracking-tight text-ink">
              {prices.scale}
            </span>
            <span className="text-sm text-ink-muted">{unit}</span>
          </p>
          <p className="mt-1 text-xs font-medium text-success">{trialCopy}</p>
          <FeatureList features={SCALE_FEATURES} />
          <div className="mt-8 pt-2">
            <a
              href={planHref("scale")}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field border border-line px-4 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              {selectLabel("Scale")}
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-ink-muted">
        Refer a founder: you both get 1 free month, capped at 3 free months per account. Add a
        card anytime for +100 bonus credits — trials never charge without confirmation.
      </p>
    </div>
  );
}
