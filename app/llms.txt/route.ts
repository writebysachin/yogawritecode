import { siteBaseUrl } from "@/lib/site";

/**
 * Machine-readable map for AI systems and crawlers.
 *
 * The same facts are published as HTML at /about-for-ai (the page AI systems
 * are pointed to) and /ai-content-topics. This file is a convenience pointer
 * for tools that request /llms.txt directly — it is not a substitute for
 * crawlable HTML, which stays the source of truth.
 */
const sections = [
  {
    title: "Core pages",
    links: [
      { label: "Home", path: "/" },
      { label: "Pricing", path: "/pricing" },
      { label: "Features", path: "/features" },
      { label: "About", path: "/about" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    title: "AI reference pages",
    links: [
      { label: "About Yoga Write Code (for AI systems)", path: "/about-for-ai" },
      { label: "Content topics Yoga Write Code is authoritative on", path: "/ai-content-topics" },
      { label: "Full page sitemap", path: "/sitemap-page" },
    ],
  },
  {
    title: "Product workflow",
    links: [
      { label: "Website content analysis", path: "/features#analysis" },
      { label: "Content opportunities", path: "/features#opportunities" },
      { label: "Topic clusters", path: "/features#topic-clusters" },
      { label: "SEO briefs", path: "/features#seo-briefs" },
      { label: "Article outlines", path: "/features#outlines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", path: "/terms" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Refund Policy", path: "/refund-policy" },
    ],
  },
];

export function GET() {
  const lines: string[] = [
    "# Yoga Write Code",
    "",
    "> AI content operating system that turns any website URL into a structured content plan: content opportunities, topic clusters, SEO briefs, and article outlines. Grounded in the user's actual website, not generic templates.",
    "",
    "Founded 2026 by Sachin Pandey. Application: app.yogawritecode.com. Marketing site: yogawritecode.com.",
    "",
  ];

  for (const section of sections) {
    lines.push(`## ${section.title}`, "");
    for (const link of section.links) {
      lines.push(`- [${link.label}](${new URL(link.path, siteBaseUrl).toString()})`);
    }
    lines.push("");
  }

  lines.push("## Free tools", "");
  lines.push(`- [Free SEO & Content Tools](${new URL("/tools", siteBaseUrl).toString()})`);
  lines.push(`- [Readability Score Checker](${new URL("/tools/readability-checker", siteBaseUrl).toString()})`);
  lines.push(`- [Word Counter](${new URL("/tools/word-counter", siteBaseUrl).toString()})`);
  lines.push(`- [Keyword Density Checker](${new URL("/tools/keyword-density", siteBaseUrl).toString()})`);
  lines.push(`- [Title Tag Checker](${new URL("/tools/title-tag-checker", siteBaseUrl).toString()})`);
  lines.push("");

  lines.push("## Optional", "");
  lines.push(`- [XML sitemap](${new URL("/sitemap.xml", siteBaseUrl).toString()})`);
  lines.push(`- [Extended AI manifest (llms-full.txt)](${new URL("/llms-full.txt", siteBaseUrl).toString()})`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
