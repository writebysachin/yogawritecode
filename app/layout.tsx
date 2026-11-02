import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import { GaPageView, GoogleTag } from "@/components/analytics/google-tag";
import { TagManager } from "@/components/analytics/tag-manager";
import { gaMeasurementId } from "@/lib/analytics";
import { siteBaseUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export const metadata: Metadata = {
  metadataBase: siteBaseUrl,
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description:
    "Yoga Write Code is an AI content operating system that turns your website into structured content planning — content opportunities, topic clusters, SEO briefs, and outlines.",
  keywords: [
    "AI content planning",
    "AI content strategy",
    "SEO content planning",
    "topic clusters",
    "topical authority",
    "SEO briefs",
    "content outlines",
    "SaaS content marketing",
    "content operations",
    "ICP keyword research",
    "AI writing tool",
    "content workflow",
    "website content analysis",
    "content brief generator",
    "AI SEO tool",
  ],
  authors: [{ name: "Sachin Pandey", url: "https://sachinpandey.com.np" }],
  creator: "Sachin Pandey",
  publisher: "Yoga Write Code",
  category: "Technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description:
      "Turn your website into structured content planning — content opportunities, topic clusters, SEO briefs, and outlines.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description:
      "Turn your website into structured content planning — content opportunities, topic clusters, SEO briefs, and outlines.",
    images: ["/opengraph-image"],
    creator: "@yogawritecode",
    site: "@yogawritecode",
  },
  verification: {
    google: "tL8-FZhkoHwlI57LESE58csCvMLzdQRxxCi6Cs6d7bc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${inter.variable} ${satoshi.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-canvas font-sans text-ink antialiased">
        {children}
        {/* GA4 loads on every page (Consent Mode defaults to denied); GTM,
            Clarity and PostHog still wait for the visitor's choice. */}
        {gaMeasurementId ? <GoogleTag measurementId={gaMeasurementId} /> : null}
        <Suspense fallback={null}>
          {gaMeasurementId ? <GaPageView /> : null}
        </Suspense>
        <TagManager />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
