import type { Metadata } from "next";
import Link from "next/link";
import { TitleTagChecker } from "./title-tag-checker";

export const metadata: Metadata = {
  title: "Free Title Tag Checker — SEO Length & SERP Preview",
  description:
    "Check if your page title is the right length for Google. Get a live pixel-width estimate and a Google SERP preview. Free, no sign-up.",
  alternates: { canonical: "/tools/title-tag-checker" },
};

export default function TitleTagCheckerPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/tools" className="transition-colors hover:text-ink">
            Free Tools
          </Link>
          <span aria-hidden="true">→</span>
          <span className="text-ink-secondary">Title Tag Checker</span>
        </nav>

        <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Title Tag Checker
        </h1>
        <p className="mt-4 text-[17px] leading-8 text-ink-secondary">
          Check if your page title is the right length for Google search results. Aim for 50–60 characters.
        </p>

        <div className="mt-8">
          <TitleTagChecker />
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
