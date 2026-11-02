import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Content Topics & Topical Map",
  description: "Yoga Write Code covers AI content strategy, SEO planning, topic clusters, content briefs, and content operations for SaaS and agencies.",
  alternates: { canonical: "/ai-content-topics" },
};

const pillars = [
  {
    pillar: "AI Content Strategy",
    description: "How to use AI to plan, prioritize, and execute a content strategy grounded in your business — not generic keyword lists.",
    topics: [
      "What is an AI content operating system",
      "How to build a content strategy with AI",
      "AI vs manual content planning",
      "Content strategy for SaaS founders",
      "Content strategy for agencies",
      "ICP-driven keyword research",
      "How to use AI for topical authority",
    ],
  },
  {
    pillar: "Topic Clusters & Topical Authority",
    description: "Building pillar-and-cluster content structures that help AI and search engines understand your site's depth on a subject.",
    topics: [
      "What is a topic cluster",
      "How to build topic clusters for SEO",
      "Pillar page vs cluster page",
      "Topical authority explained",
      "How AI reads topical structure",
      "Topic cluster examples for SaaS",
      "Internal linking for topic clusters",
    ],
  },
  {
    pillar: "SEO Briefs & Content Outlines",
    description: "Creating structured briefs and outlines that give writers — human or AI — everything needed to produce ranking content.",
    topics: [
      "What is an SEO content brief",
      "How to write an SEO brief",
      "SEO brief template",
      "Content outline structure",
      "H1, H2, H3 hierarchy for SEO",
      "How to research headings for content",
      "Entities in SEO content",
    ],
  },
  {
    pillar: "Website Content Analysis",
    description: "Using your existing website as the foundation for content planning — understanding what you have and what gaps to fill.",
    topics: [
      "Website content audit",
      "Content gap analysis",
      "How to find content opportunities",
      "Competitive content analysis",
      "What pages to create first",
      "Content relevance scoring",
    ],
  },
  {
    pillar: "Content Operations",
    description: "Scaling content production systematically — from brief to published — without losing quality or strategic alignment.",
    topics: [
      "What is content operations",
      "Content workflow for small teams",
      "Content calendar with AI",
      "Scaling content for agencies",
      "AI content workflow automation",
      "Content brief to draft pipeline",
    ],
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Yoga Write Code — Content Topics & Topical Map",
  description: "A structured map of every content topic Yoga Write Code covers, organized by content pillar.",
  url: "https://yogawritecode.com/ai-content-topics",
  about: pillars.map((p) => ({
    "@type": "Thing",
    name: p.pillar,
    description: p.description,
  })),
};

export default function TopicalMapPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 font-sans sm:px-8 sm:py-20">
      <JsonLd data={jsonLd} />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Topical Authority</p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Content Topics We Cover
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-secondary">
        Yoga Write Code is the authority on AI-powered content planning — from strategy to outlines. Every pillar below represents a topic cluster we go deep on.
      </p>
      <div className="mt-12 space-y-12">
        {pillars.map((pillar) => (
          <section key={pillar.pillar}>
            <h2 className="font-heading text-xl font-bold tracking-tight text-ink">
              {pillar.pillar}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{pillar.description}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {pillar.topics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2 rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink-secondary"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {topic}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-12 rounded-card border border-brand bg-brand-soft/20 p-6">
        <h2 className="font-heading text-lg font-bold text-ink">
          Ready to build your own topical authority?
        </h2>
        <p className="mt-2 text-sm text-ink-secondary">
          Yoga Write Code analyzes your website and generates a complete topic cluster plan grounded in your business — not a generic keyword list.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-field bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Start free — no card required
        </Link>
      </div>
    </main>
  );
}
