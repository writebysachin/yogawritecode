import type { Metadata } from "next";
import Link from "next/link";
import { KeywordDensityChecker } from "./keyword-density-checker";

export const metadata: Metadata = {
  title: "Free Keyword Density Checker",
  description:
    "Find your top keywords and see how often they appear in your content. Auto-detect top 10 or check a specific keyword's density.",
  alternates: { canonical: "/tools/keyword-density" },
};

export default function KeywordDensityPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/tools" className="transition-colors hover:text-ink">
            Free Tools
          </Link>
          <span aria-hidden="true">→</span>
          <span className="text-ink-secondary">Keyword Density Checker</span>
        </nav>

        <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Keyword Density Checker
        </h1>
        <p className="mt-4 text-[17px] leading-8 text-ink-secondary">
          Find your top keywords and see how often they appear in your content. Leave the keyword field empty to auto-detect the top 10.
        </p>

        <div className="mt-8">
          <KeywordDensityChecker />
        </div>

        <div className="mt-12 rounded-2xl border border-brand-soft bg-brand-soft/30 p-8 text-center">
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
    </div>
  );
}
