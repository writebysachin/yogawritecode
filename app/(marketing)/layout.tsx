import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/footer";
import { SiteHeader } from "@/components/marketing/header";

const OG_IMAGE = "https://yogawritecode.com/opengraph-image";

export const metadata: Metadata = {
  title: {
    default: "Yoga Write Code",
    template: "%s · Yoga Write Code",
  },
  description:
    "Yoga Write Code is an AI content operating system that turns your website into structured content planning — content opportunities, topic clusters, SEO briefs, and outlines.",
  openGraph: {
    siteName: "Yoga Write Code",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Yoga Write Code", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
