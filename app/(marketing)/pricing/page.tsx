import type { Metadata } from "next";
import Link from "next/link";
import { PricingPlans } from "@/components/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with 50 credits, no card required. Starter $9, Pro $19, Scale $40. Cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <main className="bg-canvas">
        <div className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8 sm:py-20">
          <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-secondary">
            Start free. Upgrade when your pipeline pays for itself. Cancel anytime.
          </p>
          <p className="mt-3 max-w-xl text-sm text-ink-muted">
            Free includes 50 credits with no credit card. Paid trials run 7 days with no charge.
            Referrals earn 1 free month each (capped at 3 per account); adding a card adds +100
            bonus credits.
          </p>

          <div className="mt-10">
            <PricingPlans isPro={false} />
          </div>

          <p className="mt-8 text-xs text-ink-muted">
            Secure payments powered by Dodo Payments. Cancel anytime. By subscribing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/refund-policy" className="underline underline-offset-4 hover:text-ink">
              Refund Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </>
  );
}
