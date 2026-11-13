import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all crawlers including AI (GPTBot, ClaudeBot, PerplexityBot, etc.)
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Explicitly welcome AI crawlers to all public content
      { userAgent: "GPTBot",        allow: "/" },
      { userAgent: "ClaudeBot",     allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Googlebot",     allow: "/" },
      { userAgent: "anthropic-ai",  allow: "/" },
      { userAgent: "CCBot",         allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User",  allow: "/" },
    ],
    sitemap: new URL("/sitemap.xml", siteBaseUrl).toString(),
  };
}
