import type { Metadata } from "next";
import Link from "next/link";
import { PricingPlans } from "@/components/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Starter $9, Pro $19, Scale $40. Simple pricing, cancel anytime.",
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
            Simple, transparent pricing. Cancel anytime.
          </p>

          <div className="mt-10">
            <PricingPlans isPro={false} mode="marketing" />
          </div>

          <p className="mt-8 text-xs text-ink-muted">
            Payments are handled securely by Dodo Payments when you upgrade. Cancel anytime. By
            subscribing you agree to our{" "}
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
