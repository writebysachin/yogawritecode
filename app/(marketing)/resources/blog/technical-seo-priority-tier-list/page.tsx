import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { siteBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Technical SEO Priority Tier List: S to E Ranked by Real Impact",
  description:
    "A ranked tier list of technical SEO factors from S to E — crawl blocks, canonicals, redirects, Core Web Vitals, image compression, alt text, and PageSpeed obsession. What actually matters and what's a waste of time.",
  alternates: { canonical: "/resources/blog/technical-seo-priority-tier-list" },
  openGraph: {
    title: "Technical SEO Priority Tier List: S to E Ranked by Real Impact",
    description:
      "Fixing crawl and index blocks is S-tier. Obsessing over a 98→100 Lighthouse score is E-tier. Here's the full ranked breakdown of technical SEO priorities.",
    url: "/resources/blog/technical-seo-priority-tier-list",
  },
};

const pageUrl = new URL("/resources/blog/technical-seo-priority-tier-list", siteBaseUrl).toString();
const origin = siteBaseUrl.origin;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: "Technical SEO Priority Tier List: S to E Ranked by Real Impact",
      description:
        "A ranked tier list of technical SEO factors from S to E — crawl blocks, canonicals, redirects, Core Web Vitals, image compression, alt text, and PageSpeed obsession.",
      url: pageUrl,
      datePublished: "2026-11-08",
      dateModified: "2026-11-08",
      author: { "@type": "Person", name: "Harry" },
      publisher: { "@id": `${origin}/#organization` },
      isPartOf: { "@id": `${origin}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/resources/blog` },
        { "@type": "ListItem", position: 3, name: "Technical SEO Priority Tier List", item: pageUrl },
      ],
    },
  ],
};

const tiers = [
  {
    tier: "S",
    label: "Highest Impact",
    color: "bg-red-500/10 text-red-600 border-red-200",
    dot: "bg-red-500",
    items: [
      {
        factor: "Fixing Crawl & Index Blocks",
        verdict:
          "If Google can't crawl or index your pages, nothing else matters. Blocked robots.txt rules, noindex tags in the wrong places, or login-walled content mean zero rankings — full stop. This is the foundation everything else sits on.",
      },
    ],
  },
  {
    tier: "A",
    label: "High Impact",
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    dot: "bg-orange-500",
    items: [
      {
        factor: "Canonical & Duplicate Issues",
        verdict:
          "Stops Google from getting confused about which version of a page to rank. When you have duplicate content across URLs — www vs non-www, trailing slashes, pagination, syndicated content — canonicals tell Google which page to credit. Get this wrong and you split your authority across versions.",
      },
      {
        factor: "Redirect Chains & 404s on Linked Pages",
        verdict:
          "Every hop in a redirect chain leaks link equity. A 404 on a page with backlinks is a direct loss of ranking power. Clean these up and you stop bleeding authority you've already earned.",
      },
      {
        factor: "XML Sitemap Hygiene",
        verdict:
          "Your sitemap should only include pages you actually want Google to index — no redirects, no noindex pages, no 404s. A bloated or inaccurate sitemap wastes crawl budget and signals poor site hygiene to Googlebot.",
      },
    ],
  },
  {
    tier: "B",
    label: "Solid Impact",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
    items: [
      {
        factor: "Internal Linking from Pages That Already Rank",
        verdict:
          "If you have pages with real authority, linking from them to other important pages on your site passes that authority along. This is one of the most underused levers in SEO — it costs nothing and works.",
      },
      {
        factor: "INP & Core Web Vitals",
        verdict:
          "Caveat: bump this to A-tier if your site performance is genuinely poor. Otherwise it stays at B. Google uses Core Web Vitals as a tiebreaker, not a deciding factor. Fix INP and LCP if your scores are in the red. Don't over-engineer them if they're already acceptable.",
      },
    ],
  },
  {
    tier: "C",
    label: "Moderate Impact",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
    items: [
      {
        factor: "Image Compression",
        verdict:
          "Helps page speed, which feeds into Core Web Vitals. Worth doing — it's usually low effort and improves LCP. But it's not a direct ranking driver on its own.",
      },
    ],
  },
  {
    tier: "D",
    label: "Low Impact",
    color: "bg-surface-subtle text-ink-secondary border-line",
    dot: "bg-ink-muted",
    items: [
      {
        factor: "Alt Text",
        verdict:
          "Important for accessibility and image search, but minimal impact on organic rankings for your main pages. Get it right once, then move on. Don't over-optimize.",
      },
    ],
  },
  {
    tier: "E",
    label: "Diminishing Returns",
    color: "bg-surface-subtle text-ink-muted border-line",
    dot: "bg-line-strong",
    items: [
      {
        factor: "Obsessing Over a 98 → 100 PageSpeed Score",
        verdict:
          "This is where time goes to die. The difference between a Lighthouse score of 98 and 100 will not move the needle on rankings. Real users don't notice, and Google doesn't reward it. If your score is already in the 90s, stop. There are higher-leverage things to work on.",
      },
    ],
  },
] as const;

const takeaways = [
  "Start with crawl and index health — if Google can't see the page, nothing else matters.",
  "Canonical and duplicate issues silently split your authority. Audit them regularly.",
  "Clean redirect chains and fix 404s on linked pages to stop leaking equity.",
  "Your XML sitemap should only list pages you actively want indexed.",
  "Internal links from strong pages are a free, underused ranking lever.",
  "Core Web Vitals matter when they're bad. When they're good, move on.",
  "A Lighthouse score of 98 is fine. Chasing 100 is a waste of time.",
];

export default function TechnicalSeoPriorityTierListPage() {
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
            <span className="text-ink-secondary">Technical SEO Priority Tier List</span>
          </nav>

          {/* Header */}
          <header className="space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Technical SEO
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-5xl">
              Technical SEO Priority Tier List: S to E Ranked by Real Impact
            </h1>
            <p className="text-lg leading-relaxed text-ink-secondary">
              Not all technical SEO work is equal. This tier list ranks the factors that actually move rankings — and identifies where teams waste the most time.
            </p>
            <p className="text-sm text-ink-muted">November 8, 2026 · By Harry</p>
          </header>

          {/* Intro */}
          <div className="mt-12 space-y-5 text-[15px] leading-7 text-ink-secondary">
            <p>
              Most technical SEO audits hand you a flat list: 180 issues, all formatted the same way. A missing alt tag gets the same visual weight as a site-wide crawl block. The result is teams triaging the wrong things — polishing image compression while Google can&apos;t even index the core landing pages.
            </p>
            <p>
              This tier list puts priority back where it belongs. S-tier first. E-tier last. Work top to bottom, and you&apos;ll spend your time on what actually drives rankings.
            </p>
          </div>

          {/* Tier List */}
          <div className="mt-14 space-y-5">
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
                <div className="space-y-5">
                  {tier.items.map((item) => (
                    <div key={item.factor}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${tier.dot}`} />
                        <h3 className="font-heading text-[15px] font-bold text-ink">{item.factor}</h3>
                      </div>
                      <p className="mt-1.5 pl-4 text-sm leading-6 text-ink-secondary">{item.verdict}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bigger picture */}
          <div className="mt-14 space-y-5">
            <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-ink">
              The bigger picture
            </h2>
            <p className="text-[15px] leading-7 text-ink-secondary">
              The pattern across this tier list is consistent: <strong className="font-semibold text-ink">foundational access beats surface-level polish</strong>. Whether Google can find your pages, which pages it credits, and how efficiently it crawls your site — these are the levers with the highest return.
            </p>
            <p className="text-[15px] leading-7 text-ink-secondary">
              The low-tier items aren&apos;t wrong to fix. Alt text matters for accessibility. Image compression is worth doing once. PageSpeed is real. But none of them belong at the top of your backlog if your canonicals are broken or your sitemap is serving 404s.
            </p>
            <p className="text-[15px] leading-7 text-ink-secondary">
              Work the tiers in order. Fix S before you touch E.
            </p>
          </div>

          {/* Key takeaways */}
          <div className="mt-14 rounded-2xl border border-line bg-surface-subtle p-6">
            <h2 className="font-heading text-lg font-bold text-ink">Key takeaways</h2>
            <ul className="mt-4 space-y-3">
              {takeaways.map((point) => (
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
