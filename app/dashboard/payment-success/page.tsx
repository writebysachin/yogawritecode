import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment successful",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-surface bg-surface-subtle p-6">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-7 w-7 text-[#15803D]"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1 className="mt-5 font-sans text-2xl font-semibold tracking-tight text-ink">
          Payment Successful!
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          Thank you — your subscription is confirmed. Your plan is being activated now.
        </p>

        <div className="mt-5 rounded-lg border border-line bg-surface-subtle px-4 py-3 text-left">
          <p className="text-xs font-medium text-ink-secondary">What happens next</p>
          <ul className="mt-2 space-y-1.5 text-xs text-ink-muted">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Your subscription is activated automatically via a secure payment webhook — this
              usually takes a few seconds.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Head to the dashboard; if your plan hasn&apos;t updated yet, wait a moment and
              refresh the page.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              A receipt will be emailed to you by Dodo Payments.
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Continue to dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            className="inline-flex h-10 items-center justify-center rounded-field border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-subtle"
          >
            View account &amp; billing
          </Link>
        </div>

        <p className="mt-5 text-xs text-ink-muted">
          Something look wrong?{" "}
          <a
            href="mailto:hello@yogawritecode.com"
            className="underline underline-offset-4 hover:text-ink"
          >
            hello@yogawritecode.com
          </a>
        </p>
      </div>
    </div>
  );
}
