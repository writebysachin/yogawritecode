"use client";

import { useState } from "react";

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
 */
export function CheckoutButton({
  paymentLink,
  label = "Upgrade to Pro",
}: {
  paymentLink?: string | null;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  const link = paymentLink?.trim() ?? "";
  const configured = link.length > 0;

  function handleClick() {
    if (!configured || pending) return;

    let target: string;
    try {
      const url = new URL(link);
      // URLSearchParams URL-encodes the value for us (INT-4.2).
      url.searchParams.set("redirect_url", PAYMENT_SUCCESS_URL);
      target = url.toString();
    } catch (error) {
      console.error("[checkout] the configured payment link is not a valid URL", error);
      setPending(false);
      return;
    }

    setPending(true);
    window.location.assign(target);
  }

  if (!configured) {
    return (
      // The tooltip lives on the wrapper because a disabled button does not
      // reliably show its own tooltip.
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
      {pending ? "Redirecting..." : label}
    </button>
  );
}
