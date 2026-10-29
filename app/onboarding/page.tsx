import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  scale: "Scale",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ welcome?: string; plan?: string; cycle?: string }>;
}) {
  const { welcome, plan, cycle } = (await searchParams) ?? {};
  const isWelcome = welcome === "1";
  const planName = plan ? (PLAN_LABEL[plan] ?? plan) : null;
  const billing = cycle === "yearly" ? "yearly" : "monthly";

  const steps = [
    {
      title: "See plans and pick your fit",
      body: planName
        ? `You picked ${planName} (${billing}) — review it on pricing, or change your mind there. Free includes 50 credits, no card required.`
        : "Start with a 7-day free trial, or explore the free tier first. No card required.",
      href: plan
        ? `/dashboard/pricing?plan=${plan}&cycle=${billing}&new=1`
        : "/dashboard/pricing?new=1",
      cta: "View pricing",
    },
    {
      title: "Review and check out",
      body: "Confirm your plan and billing period on one calm page, then continue to secure checkout powered by Dodo Payments.",
      href: plan ? `/checkout?plan=${plan}&cycle=${billing}` : "/checkout",
      cta: "Go to checkout",
    },
    {
      title: "Add your website",
      body: "Create a project from your domain — we analyze it and find content opportunities.",
      href: "/dashboard/projects/new",
      cta: "Create project",
    },
    {
      title: "Generate your plan",
      body: "Topic clusters, SEO briefs, outlines and drafts from one calm workspace.",
      href: "/dashboard",
      cta: "Go to dashboard",
    },
  ];

  return (
    <main className="min-h-screen bg-canvas px-5 py-20 font-sans sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          {isWelcome ? "Welcome — you're in" : "Welcome"}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          {isWelcome ? "Welcome! Let's set up your workspace" : "Let's set up your workspace"}
        </h1>
        <p className="mt-4 text-lg text-ink-secondary">
          {planName ? (
            <>
              Nice pick — <span className="font-medium text-ink">{planName}</span> ({billing}).
              Four quick steps: pricing, checkout, website, content plan. Skip any of them and
              come back later.
            </>
          ) : (
            "Four quick steps — pricing, checkout, website, content plan. You can skip any of them and come back later."
          )}
        </p>

        <ol className="mt-12 space-y-6">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-card border border-line bg-surface p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Step {i + 1}
              </p>
              <h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-ink">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">{step.body}</p>
              <Link
                href={step.href}
                className="mt-4 inline-flex items-center rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white shadow-pop transition-colors hover:bg-brand-hover"
              >
                {step.cta}
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-sm text-ink-muted">
          <Link href="/dashboard" className="font-medium text-ink-secondary hover:text-ink">
            Skip for now →
          </Link>
        </p>
      </div>
    </main>
  );
}
