import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-cta";

export const metadata: Metadata = {
  title: "Solutions — Yoga Write Code",
  description:
    "Content workflows built for agencies and SaaS founders. Repeatable, structured SEO content planning from a single platform.",
  alternates: { canonical: "/solutions" },
};

const saasBenefits = [
  {
    title: "Start from your product, not a keyword list",
    text: "The website analysis grounds every content opportunity in what your SaaS actually does — your features, your audience, your category.",
  },
  {
    title: "Build topical authority fast",
    text: "Topic clusters give your blog the pillar-and-supporting-article structure that ranks. Skip the spreadsheet — it's built in.",
  },
  {
    title: "Go from idea to draft in one afternoon",
    text: "Most founders can run the full workflow — analysis to article outline — in under 15 minutes per topic. No SEO agency required.",
  },
  {
    title: "Content that compounds",
    text: "Internal linking suggestions are built into every cluster, so each new article strengthens the ones around it.",
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

export default function SolutionsPage() {
  return (
    <>
      <main className="bg-canvas font-sans">
        {/* Hero */}
        <section className="px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-[1160px]">
            <Eyebrow>Solutions</Eyebrow>
            <h1 className="font-heading mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
              Content workflows that fit your team.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink-secondary">
              Whether you run an agency producing content for clients or a SaaS building
              topical authority, Yoga Write Code fits the way you work.
            </p>
          </div>
        </section>

        {/* Solution cards */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-5 md:grid-cols-2">
            {/* Agencies card */}
            <Link
              href="/solutions/agencies"
              className="group rounded-2xl border border-line bg-surface p-8 transition hover:-translate-y-1 hover:border-brand-soft hover:shadow-pop"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-xl">
                🏢
              </div>
              <h2 className="font-heading mt-5 text-xl font-bold text-ink">For Agencies</h2>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                Repeatable workflows for client content. Run the same 5-step process across
                every client site. Deliver briefs and outlines that clients actually approve.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition group-hover:gap-2.5">
                Learn more <span aria-hidden="true">→</span>
              </span>
            </Link>

            {/* SaaS Founders card */}
            <a
              href="/solutions#saas-founders"
              className="group rounded-2xl border border-line bg-surface p-8 transition hover:-translate-y-1 hover:border-brand-soft hover:shadow-pop"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-xl">
                🚀
              </div>
              <h2 className="font-heading mt-5 text-xl font-bold text-ink">For SaaS Founders</h2>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                Build topical authority for your product. Turn your SaaS website into a full
                content strategy in an afternoon — not a quarter.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition group-hover:gap-2.5">
                See how <span aria-hidden="true">↓</span>
              </span>
            </a>
          </div>
        </section>

        {/* SaaS founders section */}
        <section id="saas-founders" className="border-t border-line bg-surface-subtle px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-[1160px]">
            <div className="mx-auto mb-10 max-w-xl">
              <Eyebrow>For SaaS Founders</Eyebrow>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
                From product page to content machine.
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-ink-secondary">
                You built the product. Now build the audience. Yoga Write Code turns your
                existing website into a content strategy you can execute yourself — no agency,
                no SEO consultant, no bloated spreadsheet.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {saasBenefits.map(({ title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-line bg-surface p-6"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-success-soft text-sm font-extrabold text-success">
                    ✓
                  </span>
                  <h3 className="font-heading mt-4 text-[15px] font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-ink-secondary">{text}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-[10px] bg-brand px-5 py-3 text-sm font-semibold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                Start free <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/features"
                className="rounded-[10px] border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-line-strong"
              >
                See all features
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <MarketingCta
          title="See it on your own website."
          description="Start with your URL. Get a full content strategy grounded in what your business actually does — in under 15 minutes."
          primaryLabel="Start free"
          primaryHref="/signup"
          secondaryLabel="Talk to us"
          secondaryHref="mailto:hello@yogawritecode.com"
        />
      </main>
    </>
  );
}
