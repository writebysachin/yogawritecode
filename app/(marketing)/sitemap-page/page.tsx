import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Complete sitemap of Yoga Write Code — all pages, features, solutions, comparisons, and resources.",
  alternates: { canonical: "/sitemap-page" },
};

const sections = [
  {
    title: "Main",
    links: [
      { label: "Home", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "All Features", href: "/features" },
      { label: "Topic Clusters", href: "/features#topic-clusters" },
      { label: "SEO Briefs", href: "/features#seo-briefs" },
      { label: "Content Outlines", href: "/features#outlines" },
      { label: "Website Analysis", href: "/features#analysis" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Solutions Overview", href: "/solutions" },
      { label: "For Agencies", href: "/solutions/agencies" },
      { label: "For SaaS Founders", href: "/solutions#saas-founders" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "Compare Overview", href: "/compare" },
      { label: "vs SurferSEO", href: "/compare/surfer-seo" },
      { label: "vs Frase", href: "/compare/frase" },
      { label: "vs Jasper", href: "/compare/jasper" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/resources/blog" },
      { label: "FAQs", href: "/resources/faqs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Sign Up Free", href: "/signup" },
      { label: "Log In", href: "/login" },
    ],
  },
] as const;

export default function SitemapPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 font-sans sm:px-8 sm:py-20">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Sitemap
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-ink-secondary">
        Every page on Yoga Write Code — the AI content operating system that turns your website into structured content plans.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {section.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-secondary transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
