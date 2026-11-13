import type { Metadata } from "next";
import Link from "next/link";
import { ReadabilityChecker } from "./readability-checker";

export const metadata: Metadata = {
  title: "Readability Score Checker — Free Flesch-Kincaid Tool",
  description:
    "Paste any article and instantly get a Flesch-Kincaid readability score, grade level, and actionable tips to improve your content.",
  alternates: { canonical: "/tools/readability-checker" },
};

export default function ReadabilityCheckerPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/tools" className="hover:text-ink transition-colors">
            Free Tools
          </Link>
          <span aria-hidden="true">→</span>
          <span className="text-ink-secondary">Readability Score Checker</span>
        </nav>

        <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Readability Score Checker
        </h1>
        <p className="mt-4 text-[17px] leading-8 text-ink-secondary">
          Paste any article and get a Flesch-Kincaid readability grade. See exactly how easy — or hard — your content is to read.
        </p>

        <div className="mt-8">
          <ReadabilityChecker />
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
