"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { completeOnboarding } from "@/app/onboarding/actions";
import type { BillingCycle } from "@/lib/dodo";

type PlanId = "free" | "starter" | "pro" | "scale";

const GOALS = [
  {
    value: "personal-blog",
    label: "My own blog or personal brand",
    hint: "Grow an audience with consistent, search-friendly articles.",
  },
  {
    value: "saas-content",
    label: "Content for a SaaS or startup",
    hint: "Turn product expertise into a pipeline of organic traffic.",
  },
  {
    value: "agency-client",
    label: "Client content for an agency",
    hint: "Plan, brief and ship content for multiple clients.",
  },
  {
    value: "something-else",
    label: "Something else",
    hint: "Newsletters, local business, ecommerce — we'll adapt.",
  },
] as const;

const PLANS: Array<{
  id: PlanId;
  name: string;
  blurb: string;
  monthly: number;
  yearly: number;
  features: string[];
  popular?: boolean;
}> = [
  {
    id: "free",
    name: "Free",
    blurb: "Try the full workflow",
    monthly: 0,
    yearly: 0,
    features: ["50 AI credits", "2 active projects", "Full 5-step workflow"],
  },
  {
    id: "starter",
    name: "Starter",
    blurb: "For solo bloggers",
    monthly: 9,
    yearly: 86,
    features: ["200 credits / month", "3 active projects", "Markdown + PDF export"],
  },
  {
    id: "pro",
    name: "Pro Writer",
    blurb: "For serious writers",
    monthly: 19,
    yearly: 182,
    features: ["Unlimited credits", "Unlimited projects", "Priority processing"],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    blurb: "For agencies and teams",
    monthly: 40,
    yearly: 384,
    features: ["Everything in Pro", "Client-ready exports", "Dedicated support"],
  },
];

const PLAN_IDS = new Set<string>(PLANS.map((plan) => plan.id));

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      {pending ? "Setting up your workspace…" : label}
    </button>
  );
}

export function OnboardingWizard({
  initialPlan,
  initialCycle,
  email,
  error,
}: {
  initialPlan?: string;
  initialCycle?: BillingCycle;
  email: string;
  error?: string;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<PlanId>(
    initialPlan && PLAN_IDS.has(initialPlan) ? (initialPlan as PlanId) : "free",
  );
  const [cycle, setCycle] = useState<BillingCycle>(initialCycle ?? "monthly");

  const selectedPlan = PLANS.find((item) => item.id === plan) ?? PLANS[0];
  const isPaid = plan !== "free";
  const price = cycle === "yearly" ? selectedPlan.yearly : selectedPlan.monthly;
  const unit = plan === "free" ? "/ forever" : cycle === "yearly" ? "/ year" : "/ month";
  const submitLabel = isPaid ? `Start 7-day ${selectedPlan.name} trial` : "Start free plan";

  return (
    <form action={completeOnboarding} className="mt-10">
      <input type="hidden" name="goal" value={goal} />
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="cycle" value={cycle} />

      <ol className="flex items-center gap-3 text-xs font-medium">
        {["About you", "Choose plan"].map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                  done || active
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface text-ink-muted"
                }`}
              >
                {done ? <Check size={13} /> : index + 1}
              </span>
              <span className={active ? "text-ink" : "text-ink-muted"}>{label}</span>
              {index === 0 ? <span className="ml-2 h-px w-8 bg-line" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="mt-5 rounded-control border-l-2 border-error bg-error-soft px-3 py-2 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
            What are you building?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-secondary">
            One quick question so we can tailor your workspace. You can change this later.
          </p>

          <div className="mt-7 grid gap-3" role="radiogroup" aria-label="What are you building?">
            {GOALS.map((option) => {
              const selected = goal === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setGoal(option.value)}
                  className={`flex items-start gap-3.5 rounded-card border p-4 text-left transition-colors ${
                    selected
                      ? "border-brand bg-brand-soft/30 ring-1 ring-brand"
                      : "border-line bg-surface hover:border-ink/25"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-brand bg-brand text-white" : "border-line bg-surface"
                    }`}
                  >
                    {selected ? <Check size={12} /> : null}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-ink-muted">
                      {option.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-xs text-ink-muted">{email}</p>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={!goal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-field bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
                Pick your plan
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-secondary">
                Start free, or try any paid plan for 7 days. No card required — you will not be
                charged today.
              </p>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1">
              <button
                type="button"
                onClick={() => setCycle("monthly")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  cycle === "monthly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle("yearly")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  cycle === "yearly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
                }`}
              >
                Yearly
                <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Choose a plan">
            {PLANS.map((option) => {
              const selected = plan === option.id;
              const optionPrice =
                option.id === "free"
                  ? "$0"
                  : cycle === "yearly"
                    ? `$${option.yearly}`
                    : `$${option.monthly}`;
              const optionUnit =
                option.id === "free" ? "/ forever" : cycle === "yearly" ? "/ year" : "/ month";

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPlan(option.id)}
                  className={`relative rounded-card border p-5 text-left transition-colors ${
                    selected
                      ? "border-brand bg-brand-soft/25 ring-1 ring-brand"
                      : "border-line bg-surface hover:border-ink/25"
                  }`}
                >
                  {option.popular ? (
                    <span className="absolute right-4 top-4 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                      Most popular
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        selected ? "border-brand bg-brand text-white" : "border-line bg-surface"
                      }`}
                    >
                      {selected ? <Check size={10} /> : null}
                    </span>
                    <span className="text-sm font-semibold text-ink">{option.name}</span>
                  </span>
                  <span className="mt-2 block text-xs text-ink-muted">{option.blurb}</span>
                  <span className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-sans text-2xl font-semibold tracking-tight text-ink">
                      {optionPrice}
                    </span>
                    <span className="text-xs text-ink-muted">{optionUnit}</span>
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-success">
                    {option.id === "free" ? "No card required" : "7-day free trial · no card"}
                  </span>
                  <span className="mt-4 block space-y-1 border-t border-line pt-3">
                    {option.features.map((feature) => (
                      <span key={feature} className="flex items-center gap-2 text-xs text-ink-secondary">
                        <Check size={12} className="shrink-0 text-success" />
                        {feature}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-control bg-surface-subtle px-4 py-3 text-xs leading-5 text-ink-secondary">
            {isPaid ? (
              <>
                Your <span className="font-semibold text-ink">7-day {selectedPlan.name}</span> trial
                starts now at <span className="font-semibold text-ink">{`$${price} ${unit}`}</span>{" "}
                after the trial. No card is collected today.
              </>
            ) : (
              <>
                You are starting on the <span className="font-semibold text-ink">free plan</span>.
                50 credits, 2 projects, no card. Upgrade anytime.
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-field border border-line px-5 text-sm font-medium text-ink-secondary transition-colors hover:border-ink hover:text-ink"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="sm:w-64">
              <SubmitButton label={submitLabel} />
            </div>
          </div>
        </section>
      )}
    </form>
  );
}
