import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { siteBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Technical SEO Tier List: What Actually Impacts Google & AI Search",
  description:
    "Harry ranks technical SEO factors from S to F tier by real impact on Google and AI search. JavaScript is S-tier. PageSpeed is F. Here's why his takes are contrarian — and correct.",
  alternates: { canonical: "/resources/blog/technical-seo-tier-list" },
  openGraph: {
    title: "Technical SEO Tier List: What Actually Impacts Google & AI Search",
    description:
      "Harry's contrarian tier list ranks JavaScript as S-tier and PageSpeed as F-tier. Here's the breakdown of what technical SEO factors actually move the needle in 2026.",
    url: "/resources/blog/technical-seo-tier-list",
  },
};

const pageUrl = new URL("/resources/blog/technical-seo-tier-list", siteBaseUrl).toString();
const origin = siteBaseUrl.origin;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: "Technical SEO Tier List: What Actually Impacts Google & AI Search",
      description:
        "Harry ranks technical SEO factors from S to F tier by real impact on Google and AI search. JavaScript is S-tier. PageSpeed is F.",
      url: pageUrl,
      datePublished: "2026-11-08",
      dateModified: "2026-11-08",
      author: {
        "@type": "Person",
        name: "Harry",
      },
      publisher: { "@id": `${origin}/#organization` },
      isPartOf: { "@id": `${origin}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/resources/blog` },
        {
          "@type": "ListItem",
          position: 3,
          name: "Technical SEO Tier List",
          item: pageUrl,
        },
      ],
    },
  ],
};

const tiers = [
  {
    tier: "S",
    label: "Critical",
    color: "bg-red-500/10 text-red-600 border-red-200",
    dot: "bg-red-500",
    items: [
      {
        factor: "JavaScript",
        verdict:
          "If you mess this up, AI crawlers like ChatGPT can't even read your site. It's make-or-break for visibility — not just for Google, but for every AI search engine that needs to render your page to understand it.",
      },
    ],
  },
  {
    tier: "A",
    label: "High Risk if Done Wrong",
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    dot: "bg-orange-500",
    items: [
      {
        factor: "Canonical Tags",
        verdict:
          "They don't boost rankings on their own, but implement them incorrectly and you can seriously hurt yourself — telling Google to ignore the wrong pages entirely.",
      },
    ],
  },
  {
    tier: "B",
    label: "Important but Contextual",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
    items: [
      {
        factor: "301 Redirects & Migrations",
        verdict:
          "Redirect chains and loops are a genuine problem. But a single clean 301? Not a big deal. The risk is proportional to how messy your redirect structure is.",
      },
    ],
  },
  {
    tier: "C",
    label: "Nice to Fix, Not a Ranking Driver",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
    items: [
      {
        factor: "404 Errors",
        verdict:
          "Fix them for user experience. They won't tank your rankings on their own.",
      },
      {
        factor: "Meta Descriptions",
        verdict:
          "Rubbish for rankings. They don't directly help, though they can influence click-through rates in the SERP.",
      },
      {
        factor: "Title Tags",
        verdict:
          "Still carry some value, but nowhere near the heavy hitter they used to be.",
      },
      {
        factor: "H1 Tags",
        verdict:
          "Don't move the needle much for rankings anymore. Structure matters, but H1s aren't the lever people think.",
      },
    ],
  },
  {
    tier: "F",
    label: "Overrated",
    color: "bg-surface-subtle text-ink-secondary border-line",
    dot: "bg-ink-muted",
    items: [
      {
        factor: "PageSpeed / Lighthouse Score",
        verdict:
          "The metric itself is not what matters. Google and AI don't care if your Lighthouse score is 100 — they care if users bounce because your site is genuinely laggy. Chasing a perfect score is wasted effort.",
      },
    ],
  },
] as const;

export default function TechnicalSeoTierListPage() {
  return (
    <>
      <div className="min-h-screen bg-surface font-sans text-ink">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/resources/blog" className="hover:text-ink">Blog</Link>
            <span aria-hidden="true">›</span>
            <span className="text-ink-secondary">Technical SEO Tier List</span>
          </nav>

          {/* Header */}
          <header className="space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Technical SEO
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-5xl">
              Technical SEO Tier List: What Actually Impacts Google &amp; AI Search
            </h1>
            <p className="text-lg leading-relaxed text-ink-secondary">
              Harry ranks technical SEO factors by how much they actually move the needle — from S-tier to F-tier. His takes are contrarian to most SEO guides. They&apos;re also right.
            </p>
            <p className="text-sm text-ink-muted">November 8, 2026 · By Harry</p>
          </header>

          {/* Intro */}
          <div className="mt-12 space-y-5 text-[15px] leading-7 text-ink-secondary">
            <p>
              Most technical SEO content treats everything as equally important. Audit checklists that run to 200 items. Tools that flag missing meta descriptions and broken JavaScript with the same severity. The result is teams spending weeks on things that don&apos;t matter while the one issue that would actually hurt them goes unaddressed.
            </p>
            <p>
              Harry&apos;s framework cuts through that. He ranks technical SEO factors from S to F based on real-world impact — and the order will surprise you.
            </p>
          </div>

          {/* Tier List */}
          <div className="mt-14 space-y-6">
            <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-ink">
              The Tier List
            </h2>

            {tiers.map((tier) => (
              <div key={tier.tier} className={`rounded-2xl border p-6 ${tier.color}`}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-heading text-3xl font-extrabold">{tier.tier}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] opacity-70">Tier</p>
                    <p className="text-sm font-semibold">{tier.label}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {tier.items.map((item) => (
                    <div key={item.factor}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${tier.dot}`} />
                        <h3 className="font-heading text-[15px] font-bold text-ink">{item.factor}</h3>
                      </div>
                      <p className="mt-1.5 pl-4 text-sm leading-6 text-ink-secondary">{item.verdict}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* The Bigger Picture */}
          <div className="mt-14 space-y-5">
            <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-ink">
              The bigger picture
            </h2>
            <p className="text-[15px] leading-7 text-ink-secondary">
              Harry&apos;s core argument is simple: <strong className="font-semibold text-ink">JavaScript accessibility is now the #1 technical SEO factor</strong> because AI crawlers need to render your page to understand it. If your site is JavaScript-heavy and your rendering is broken, ChatGPT, Perplexity, and every other AI search tool simply cannot read your content — regardless of how good your meta descriptions or H1 tags are.
            </p>
            <p className="text-[15px] leading-7 text-ink-secondary">
              Traditional signals like meta descriptions and page speed matter far less than the SEO industry suggests — unless they are genuinely broken. A Lighthouse score of 72 is fine. A site that loads in 8 seconds on mobile is not.
            </p>
            <p className="text-[15px] leading-7 text-ink-secondary">
              The audience for this framework is SEO professionals and developers who are shifting from Google-only SEO to AI visibility. The rules of the game have changed, and the old priority order hasn&apos;t caught up yet.
            </p>
          </div>

          {/* Key Takeaways */}
          <div className="mt-14 rounded-2xl border border-line bg-surface-subtle p-6">
            <h2 className="font-heading text-lg font-bold text-ink">Key takeaways</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Fix JavaScript rendering before anything else. AI crawlers depend on it.",
                "Canonical tags are a silent killer when implemented wrong — review them carefully.",
                "A single clean 301 redirect is fine. Chains and loops are the real problem.",
                "Stop obsessing over meta descriptions and H1 tags for ranking uplift.",
                "Chase real-world page speed, not a Lighthouse score.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-6 text-ink-secondary">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Back link */}
          <div className="mt-12">
            <Link
              href="/resources/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>

        <MarketingCta />
      </div>
      <JsonLd data={jsonLd} />
    </>
  );
}
