import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-cta";

export const metadata: Metadata = {
  title: "Features — Yoga Write Code",
  description:
    "Everything inside Yoga Write Code: website analysis, content opportunities, topic clusters, SEO briefs, article outlines, and a draft editor.",
  alternates: { canonical: "/features" },
};

const steps = [
  {
    n: "01",
    title: "Analyze Website",
    text: "Paste your URL. Get a grounded company summary, category, and target audience.",
  },
  {
    n: "02",
    title: "Content Opportunities",
    text: "See specific topics, quick wins, and opportunities tied to your business.",
  },
  {
    n: "03",
    title: "Topic Cluster",
    text: "Build a pillar topic with supporting articles and internal-link suggestions.",
  },
  {
    n: "04",
    title: "SEO Brief",
    text: "Get the keyword, intent, headings, questions, entities, and insights to write with.",
  },
  {
    n: "05",
    title: "Outline",
    text: "Start with a clean H1 and section structure that is ready for a writer.",
  },
];

const deepDives = [
  {
    icon: "🔍",
    title: "Website Analysis",
    text: "Paste any public URL. The AI reads your site, extracts business signals, and returns a grounded summary of your company, audience, and product category — no guessing required.",
  },
  {
    icon: "💡",
    title: "Content Opportunities",
    text: "Get 3–5 scored topics tied directly to your business. Each includes search intent, funnel stage, difficulty rating, target keywords, and a reason why it's worth pursuing.",
  },
  {
    icon: "🗂️",
    title: "Topic Clusters",
    text: "Pick a content opportunity and get a full pillar-and-cluster structure: one main pillar topic, 4–6 supporting articles, and built-in internal linking suggestions.",
  },
  {
    icon: "📋",
    title: "SEO Briefs",
    text: "Every brief includes a primary keyword, search intent, recommended headings, questions to answer, entities to mention, and competitor gap insights — everything a writer needs.",
  },
  {
    icon: "📝",
    title: "Article Outlines",
    text: "A clean, structured H1 and section-by-section outline ready to draft from. No cleanup needed — it starts write-ready.",
  },
  {
    icon: "✏️",
    title: "Draft Editor",
    text: "Write section by section with AI assistance or on your own. See readability and SEO scores update live as you write.",
  },
  {
    icon: "📤",
    title: "Export",
    text: "Export your drafts as Markdown, HTML, or PDF. Word export available on Pro and Scale.",
  },
  {
    icon: "🏆",
    title: "Competitor Gap Analysis",
    text: "Every content opportunity surfaces the topics your competitors cover that you don't yet — grounded in your actual business.",
  },
];

function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {children}
    </span>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <main className="bg-canvas font-sans">
        {/* Hero */}
        <section className="px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-[1160px]">
            <Eyebrow>All features</Eyebrow>
            <h1 className="font-heading mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
              Every feature you need to go from URL to published article.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink-secondary">
              One connected workflow — not a stack of disconnected tools. Analyze your site,
              find opportunities, build clusters, generate briefs, outline, and draft without
              leaving the platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-[10px] bg-brand px-5 py-3 text-sm font-semibold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                Start free <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/pricing"
                className="rounded-[10px] border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-line-strong"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink-muted">No credit card required</p>
          </div>
        </section>

        {/* The 5-Step Workflow */}
        <section className="bg-surface-subtle px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-[1160px]">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <Eyebrow>The workflow</Eyebrow>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
                From URL to outline in 5 steps.
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-ink-secondary">
                Built for content operations — not another point-solution SEO tool.
              </p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step) => (
                <article
                  key={step.n}
                  className="rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-brand-soft hover:shadow-pop"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-sm font-extrabold text-brand">
                    {step.n}
                  </div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-muted">
                    Step {step.n}
                  </p>
                  <h3 className="font-heading mt-1.5 text-[15px] font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-5 text-ink-secondary">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Deep-Dives */}
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-[1160px]">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <Eyebrow>Feature deep-dives</Eyebrow>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
                What each feature actually does.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {deepDives.map(({ icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-line bg-surface p-6 transition hover:border-brand-soft hover:shadow-pop"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-subtle text-xl">
                    {icon}
                  </div>
                  <h3 className="font-heading mt-4 text-base font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-secondary">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <MarketingCta
          title="Start your first content plan free."
          description="Paste your website URL and get a full content strategy — opportunities, clusters, briefs, and outlines — in under 15 minutes."
          primaryLabel="Start free"
          primaryHref="/signup"
          secondaryLabel="See pricing"
          secondaryHref="/pricing"
        />
      </main>
    </>
  );
}
