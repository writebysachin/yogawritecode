import type { Metadata } from "next";
import Link from "next/link";
import { MetaDescriptionChecker } from "./meta-description-checker";

export const metadata: Metadata = {
  title: "Free Meta Description Checker — SEO Length & SERP Preview",
  description:
    "See if your meta description will display fully in Google search results. Get a live character count and SERP preview. Free, no sign-up.",
  alternates: { canonical: "/tools/meta-description-checker" },
};

export default function MetaDescriptionCheckerPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/tools" className="transition-colors hover:text-ink">
            Free Tools
          </Link>
          <span aria-hidden="true">→</span>
          <span className="text-ink-secondary">Meta Description Checker</span>
        </nav>

        <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Meta Description Checker
        </h1>
        <p className="mt-4 text-[17px] leading-8 text-ink-secondary">
          See if your meta description will display fully in search results. Aim for 150–160 characters.
        </p>

        <div className="mt-8">
          <MetaDescriptionChecker />
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
