import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/",                    priority: 1.0, changeFrequency: "weekly"  as const },
    { path: "/about",               priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/pricing",             priority: 0.9, changeFrequency: "weekly"  as const },
    { path: "/features",            priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/solutions",           priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/solutions/agencies",  priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/compare",             priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/compare/surfer-seo",  priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/compare/frase",       priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/compare/jasper",      priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/resources/blog",      priority: 0.6, changeFrequency: "weekly"  as const },
    { path: "/resources/faqs",      priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact",             priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/signup",              priority: 0.7, changeFrequency: "monthly" as const },
    // AI-optimized pages
    { path: "/sitemap-page",        priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/ai-content-topics",   priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/about-for-ai",        priority: 0.6, changeFrequency: "monthly" as const },
    // Legal
    { path: "/privacy",             priority: 0.3, changeFrequency: "yearly"  as const },
    { path: "/terms",               priority: 0.3, changeFrequency: "yearly"  as const },
    { path: "/refund-policy",       priority: 0.3, changeFrequency: "yearly"  as const },
  ];

  return routes.map((route) => ({
    url: new URL(route.path, siteBaseUrl).toString(),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
