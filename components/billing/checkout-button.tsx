"use client";

import { useEffect, useRef, useState } from "react";
import type { BillingCycle, PaidPlanId } from "@/lib/dodo";

/**
 * Where Dodo sends the customer back after a successful payment.
 *
 * Public by design — it is embedded in the payment link, not a secret.
 */
export const PAYMENT_SUCCESS_URL =
  "https://app.yogawritecode.com/dashboard/payment-success";

const NOT_CONFIGURED = "Payments not configured";

/**
 * Starts the Dodo hosted checkout.
 *
 * The payment link is passed in as a prop by a server component — this file
 * never reads `process.env`, so no secret can ever reach the client bundle
 * (TRD SEC-6.2).
 *
 * When `autoStart` is true the button clicks itself on mount, so arriving
 * from onboarding drops the user straight into payment without an extra click.
 */
export function CheckoutButton({
  paymentLink,
  label = "Upgrade to Pro",
  plan,
  cycle,
  autoStart = false,
}: {
  paymentLink?: string | null;
  label?: string;
  plan?: PaidPlanId;
  cycle?: BillingCycle;
  autoStart?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const didAutoStart = useRef(false);

  const link = paymentLink?.trim() ?? "";
  const configured = link.length > 0;

  function buildTarget(): string | null {
    if (!configured) return null;
    try {
      const url = new URL(link);
      url.searchParams.set("redirect_url", PAYMENT_SUCCESS_URL);
      if (plan) url.searchParams.set("metadata_plan", plan);
      if (cycle) url.searchParams.set("metadata_cycle", cycle);
      return url.toString();
    } catch (error) {
      console.error("[checkout] the configured payment link is not a valid URL", error);
      return null;
    }
  }

  function handleClick() {
    if (!configured || pending) return;
    const target = buildTarget();
    if (!target) return;
    setPending(true);
    window.location.assign(target);
  }

  useEffect(() => {
    if (!autoStart || !configured || didAutoStart.current) return;
    didAutoStart.current = true;
    const timer = window.setTimeout(handleClick, 150);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, configured]);

  if (!configured) {
    return (
      <span className="inline-flex" title={NOT_CONFIGURED}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title={NOT_CONFIGURED}
          className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#7C3AED] px-6 text-sm font-semibold text-white opacity-60 sm:w-auto"
        >
          {NOT_CONFIGURED}
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#7C3AED] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
    >
      {pending ? "Redirecting to payment…" : label}
    </button>
  );
}
