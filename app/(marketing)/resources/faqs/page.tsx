import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { siteBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs — Yoga Write Code",
  description:
    "Common questions about Yoga Write Code — how it works, AI credits, integrations, billing, and data security.",
  alternates: { canonical: "/resources/faqs" },
};

const sections = [
  {
    id: "getting-started",
    heading: "Getting Started",
    items: [
      {
        q: "What is Yoga Write Code and who is it for?",
        a: "Yoga Write Code is an AI content operating system for SaaS founders, bloggers, agencies, and content teams. Paste a website URL to get content opportunities, topic clusters, SEO briefs, and article outlines — all grounded in what your business actually does.",
      },
      {
        q: "Do I need an SEO background to use it?",
        a: "No. The workflow guides you step by step and explains everything in plain language. You don't need to know what topical authority or search intent means before you start.",
      },
      {
        q: "How long does it take to get a full content plan?",
        a: "Most users have a full plan — from website analysis to article outline — in under 15 minutes.",
      },
      {
        q: "What do I need to get started?",
        a: "Just a public website URL and a free account. No credit card required.",
      },
    ],
  },
  {
    id: "workflow-features",
    heading: "Workflow & Features",
    items: [
      {
        q: "What does each step of the workflow do?",
        a: "The workflow runs in five connected steps: Analyze Website → Content Opportunities → Topic Cluster → SEO Brief → Article Outline → Draft Editor. Each step builds on the last, so your outline is always grounded in your business.",
      },
      {
        q: "Can I edit what the AI generates?",
        a: "Yes — every output can be edited or used as a starting point in the draft editor. Nothing is locked.",
      },
      {
        q: "What is a topic cluster?",
        a: "A topic cluster is a pillar topic plus a set of supporting articles with internal linking suggestions. It's the structure that builds topical authority over time, so search engines understand the breadth of your expertise.",
      },
      {
        q: "Can I use my own keywords?",
        a: "Yes — the SEO brief step lets you adjust the focus keyword before the brief is generated.",
      },
      {
        q: "Does it write the full article for me?",
        a: "Yes. The draft editor lets you write section by section with AI assistance, or on your own at whatever pace you prefer.",
      },
    ],
  },
  {
    id: "credits-plans",
    heading: "Credits & Plans",
    items: [
      {
        q: "How do AI credits work?",
        a: "Each AI step uses a small number of credits from your balance. The free plan starts with 50 credits. Paid plans include monthly credits or unlimited usage depending on the tier.",
      },
      {
        q: "What happens when I run out of credits?",
        a: "You can upgrade to a paid plan or wait for your monthly renewal. Paid plans include enough credits for active content production.",
      },
      {
        q: "Can I try it before paying?",
        a: "Yes — the free plan gives you 50 credits and 1 project with no card required. Pro and Scale include a 7-day free trial.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. You can cancel from your account settings at any time — no lock-in, no cancellation fees.",
      },
    ],
  },
  {
    id: "technical-integrations",
    heading: "Technical & Integrations",
    items: [
      {
        q: "What websites can I analyze?",
        a: "Any publicly accessible website with readable content. The analyzer works best with sites that have descriptive copy about the business, its audience, and its products.",
      },
      {
        q: "Does it integrate with Google Search Console?",
        a: "A Google Search Console connection is available. Data display in the dashboard is coming in a future update.",
      },
      {
        q: "Is my data secure?",
        a: "Yes. All data is stored in a managed Supabase database. Your content is never used to train AI models.",
      },
      {
        q: "What AI does it use?",
        a: "AWS Bedrock with Anthropic's Claude model — grounded by your actual website content, not generic prompts.",
      },
    ],
  },
  {
    id: "billing-payments",
    heading: "Billing & Payments",
    items: [
      {
        q: "Who processes payments?",
        a: "All payments are processed by Dodo Payments. Your card data never touches our servers.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes — see our Refund Policy for details.",
      },
      {
        q: "Can I switch plans?",
        a: "Yes — upgrade or downgrade from your account at any time.",
      },
    ],
  },
];

const allFaqs = sections.flatMap((s) => s.items);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqsPage() {
  return (
    <>
      <main className="bg-canvas font-sans">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
            Resources
          </p>
          <h1 className="font-heading mt-3 text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-secondary">
            Everything you want to know about Yoga Write Code — workflow, credits,
            integrations, billing, and security.
          </p>

          <nav aria-label="FAQ sections" className="mt-8 flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-secondary transition hover:border-brand hover:text-brand"
              >
                {s.heading}
              </a>
            ))}
          </nav>

          <div className="mt-14 space-y-14">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="font-heading text-xl font-bold tracking-[-0.02em] text-ink">
                  {section.heading}
                </h2>
                <div className="mt-5 divide-y divide-line border-y border-line">
                  {section.items.map(({ q, a }) => (
                    <details key={q} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                        {q}
                        <span className="shrink-0 text-xl font-normal leading-none text-ink-muted transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-6 text-ink-secondary">{a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-line bg-surface-subtle p-8 text-center">
            <p className="text-sm font-medium text-ink">Still have a question?</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Reach out and we'll get back to you quickly.
            </p>
            <a
              href="mailto:hello@yogawritecode.com"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              hello@yogawritecode.com →
            </a>
          </div>
        </div>

        <MarketingCta
          title="Ready to build your content plan?"
          description="Start with your website URL. Get a full content strategy — opportunities, clusters, briefs, and outlines — in under 15 minutes."
          primaryLabel="Start free"
          primaryHref="/signup"
          secondaryLabel="See how it works"
          secondaryHref="/#how"
        />
      </main>

      <JsonLd
        data={{
          ...jsonLd,
          url: new URL("/resources/faqs", siteBaseUrl).toString(),
        }}
      />
    </>
  );
}
