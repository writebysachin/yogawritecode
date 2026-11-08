import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on SEO content strategy, topic clusters, technical SEO, and building a scalable content operation.",
  alternates: { canonical: "/resources/blog" },
};

const posts = [
  {
    slug: "technical-seo-tier-list",
    title: "Technical SEO Tier List: What Actually Impacts Google & AI Search",
    description:
      "Harry ranks technical SEO factors from S to F tier. JavaScript is S-tier. PageSpeed is F. His contrarian takes on what actually moves the needle in 2026.",
    date: "November 8, 2026",
    tag: "Technical SEO",
  },
] as const;

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 font-sans sm:px-8 sm:py-28">
      <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
        Blog
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
        Insights on SEO content strategy, technical SEO, topic clusters, and building a scalable content operation.
      </p>

      <div className="mt-14 space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/resources/blog/${post.slug}`}
            className="group block rounded-2xl border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:border-brand-soft hover:shadow-pop"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">
              {post.tag}
            </span>
            <h2 className="font-heading mt-3 text-lg font-bold tracking-tight text-ink group-hover:text-brand">
              {post.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{post.description}</p>
            <p className="mt-4 text-xs text-ink-muted">{post.date}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
