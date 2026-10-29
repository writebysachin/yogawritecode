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
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-7 w-7 text-success"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1 className="mt-5 font-sans text-2xl font-semibold tracking-tight text-ink">
          Payment Successful!
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          Thank you for upgrading to YWC Pro. Your account is being activated.
          Next up: a quick welcome tour to set up your workspace.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/onboarding?welcome=1"
            className="inline-flex h-10 items-center justify-center rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Continue to welcome tour
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-field border border-line px-4 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            Skip to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
