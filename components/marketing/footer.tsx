import Link from "next/link";
import { MarketingBrand } from "@/components/marketing/brand";
import { FooterSubscribe } from "@/components/marketing/footer-subscribe";

const footerLinks = [
  {
    title: "Features",
    links: [
      { label: "All Features", href: "/features" },
      { label: "Topic Clusters", href: "/features#topic-clusters" },
      { label: "SEO Briefs", href: "/features#seo-briefs" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Overview", href: "/solutions" },
      { label: "Agencies", href: "/solutions/agencies" },
      { label: "SaaS Founders", href: "/solutions#saas-founders" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs SurferSEO", href: "/compare/surfer-seo" },
      { label: "vs Frase", href: "/compare/frase" },
      { label: "vs Jasper", href: "/compare/jasper" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Free Tools", href: "/tools" },
      { label: "Blog", href: "/resources/blog" },
      { label: "FAQs", href: "/resources/faqs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Content Topics", href: "/ai-content-topics" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface px-5 py-12 font-sans sm:px-8">
      <div className="mx-auto max-w-[1160px]">

        {/* Top row: brand + tagline + subscribe input */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand + tagline + newsletter stacked on the left */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <MarketingBrand />
              <p className="text-sm font-bold text-ink-secondary">Turn your website into your next five articles.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Get one useful idea every week</p>
              <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                Practical notes on AI content systems. No spam, unsubscribe anytime.
              </p>
              <div className="mt-3">
                <FooterSubscribe />
              </div>
            </div>
            <a
              href="https://dang.ai"
              target="_blank"
              rel="dofollow noopener"
              className="mt-1 inline-block"
              aria-label="Verified on DANG!"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://assets.dang.ai/badges/dang-verified-dark.png"
                alt="Verified on DANG!"
                width={160}
                height={58}
                style={{ display: "block", width: "160px", maxWidth: "100%", height: "auto", border: 0 }}
              />
            </a>
          </div>

          {/* Nav links on the right */}
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  {group.title}
                </p>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-1 text-ink-secondary transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-line pt-5">
          <div className="flex flex-col gap-3 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 Yoga Write Code. All rights reserved. Made for writers who flow.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-secondary">
              <a
                href="https://www.linkedin.com/company/yogawritecode"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com/yogawritecode"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                X (Twitter)
              </a>
              <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
              <Link href="/about-for-ai" className="transition-colors hover:text-ink">AI Info</Link>
              <Link href="/sitemap-page" className="transition-colors hover:text-ink">Site Map</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
