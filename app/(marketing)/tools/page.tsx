import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free SEO & Content Tools",
  description:
    "Free tools for content creators and SEO professionals — readability checker, word counter, keyword density analyzer, and more.",
  alternates: { canonical: "/tools" },
};

const tools = [
  {
    emoji: "📖",
    title: "Readability Score Checker",
    description:
      "Paste any article and get a Flesch-Kincaid readability grade and actionable tips.",
    href: "/tools/readability-checker",
  },
  {
    emoji: "🔢",
    title: "Word Counter",
    description:
      "Count words, characters, sentences, and estimated reading time instantly.",
    href: "/tools/word-counter",
  },
  {
    emoji: "🔍",
    title: "Keyword Density Checker",
    description:
      "Find your top keywords and see how often they appear in your content.",
    href: "/tools/keyword-density",
  },
  {
    emoji: "🏷️",
    title: "Title Tag Checker",
    description:
      "Check if your page title is the right length for Google search results.",
    href: "/tools/title-tag-checker",
  },
  {
    emoji: "📝",
    title: "Meta Description Checker",
    description:
      "See if your meta description will display fully in search results.",
    href: "/tools/meta-description-checker",
  },
  {
    emoji: "📏",
    title: "Sentence Length Analyzer",
    description:
      "Identify long and complex sentences that hurt readability.",
    href: "/tools/sentence-analyzer",
  },
] as const;

export default function FreeToolsPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <section className="px-5 pb-16 pt-20 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Free tools
            </span>
            <h1 className="font-heading mt-4 text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
              Free SEO &amp; Content Tools
            </h1>
            <p className="mt-4 text-[17px] leading-8 text-ink-secondary">
              Practical tools for content creators and SEO professionals. No sign-up required — just paste and go.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <article
                key={tool.href}
                className="rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-brand-soft hover:shadow-pop"
              >
                <span className="text-3xl" aria-hidden="true">{tool.emoji}</span>
                <h2 className="font-heading mt-4 text-[15px] font-bold text-ink">{tool.title}</h2>
                <p className="mt-2 text-[13px] leading-5 text-ink-secondary">{tool.description}</p>
                <Link
                  href={tool.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                >
                  Use tool <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-brand-soft bg-brand-soft/30 p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-ink">
              Want a complete content plan for your site?
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-ink-secondary">
              Yoga Write Code analyzes your website and builds topic clusters, SEO briefs, and outlines in minutes.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-brand px-5 py-3 text-sm font-semibold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-brand-hover"
            >
              Start free <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-2 text-xs text-ink-muted">No credit card required</p>
          </div>
        </div>
      </section>
    </div>
  );
}
