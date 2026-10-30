"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowRight, Loader2, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import type { BillingCycle, PaidPlanId } from "@/lib/dodo";

/**
 * Embedded (inline) Dodo checkout.
 *
 * Dodo's SDK renders their payment form inside #dodo-inline-checkout, so the
 * customer never leaves the site until the payment is done. The session is
 * created server-side in /api/checkout; this file only ever sees the resulting
 * checkout URL.
 *
 * If /api/checkout can't create a session it answers with a `fallbackUrl` (the
 * hosted payment link), and we redirect there instead — the payment path stays
 * open even when the embedded flow is unavailable.
 */

type Status = "idle" | "creating" | "open" | "redirecting" | "error";

type CheckoutEvent = { event_type: string; data?: Record<string, unknown> };

const ELEMENT_ID = "dodo-inline-checkout";

let sdkInitialized = false;
let sdkMode: "test" | "live" | null = null;
/** Latest event handler; the SDK only accepts one at Initialize time. */
let emit: (event: CheckoutEvent) => void = () => {};

async function loadCheckoutSdk(mode: "test" | "live") {
  const mod = await import("dodopayments-checkout");

  if (!sdkInitialized) {
    mod.DodoPayments.Initialize({
      mode,
      displayType: "inline",
      onEvent: (event) => emit(event as CheckoutEvent),
    });
    sdkInitialized = true;
    sdkMode = mode;
  } else if (sdkMode !== mode) {
    console.warn(
      `[checkout] SDK was initialised in ${sdkMode} mode; ignoring a ${mode} request.`,
    );
  }

  return mod.DodoPayments;
}

type CheckoutContextValue = {
  status: Status;
  error: string | null;
  start: () => void;
  reset: () => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

function useCheckout(): CheckoutContextValue {
  const value = useContext(CheckoutContext);
  if (!value) throw new Error("Checkout components must be rendered inside <CheckoutProvider>.");
  return value;
}

export function CheckoutProvider({
  plan,
  cycle,
  autoStart = false,
  children,
}: {
  plan: PaidPlanId;
  cycle: BillingCycle;
  autoStart?: boolean;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleEvent = useCallback((event: CheckoutEvent) => {
    switch (event.event_type) {
      case "checkout.redirect":
      case "checkout.redirect_requested":
        setStatus("redirecting");
        break;
      case "checkout.closed":
        setStatus("idle");
        break;
      case "checkout.link_expired":
        setError("This checkout session expired. Start again for a fresh one.");
        setStatus("error");
        break;
      case "checkout.error": {
        const detail = event.data?.message ?? event.data?.error;
        setError(
          typeof detail === "string" && detail.trim()
            ? detail
            : "The payment couldn't be completed. You can try again.",
        );
        setStatus("error");
        break;
      }
      default:
        break;
    }
  }, []);

  useEffect(() => {
    emit = handleEvent;
    return () => {
      emit = () => {};
    };
  }, [handleEvent]);

  // The checkout frame is mounted by the "creating" state, so the container
  // exists before Checkout.open() looks it up.
  useEffect(() => {
    if (status !== "creating") return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan, cycle }),
        });
        const data = (await response.json().catch(() => ({}))) as {
          checkoutUrl?: string;
          mode?: string;
          fallbackUrl?: string;
          error?: string;
        };

        if (!response.ok || !data.checkoutUrl) {
          if (data.fallbackUrl) {
            window.location.assign(data.fallbackUrl);
            return;
          }
          throw new Error(data.error ?? "Checkout couldn't be prepared.");
        }

        const DodoPayments = await loadCheckoutSdk(data.mode === "test" ? "test" : "live");
        if (cancelled) return;

        DodoPayments.Checkout.open({
          checkoutUrl: data.checkoutUrl,
          elementId: ELEMENT_ID,
        });
        setStatus("open");
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Checkout couldn't be prepared.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, plan, cycle]);

  useEffect(
    () => () => {
      void import("dodopayments-checkout")
        .then(({ DodoPayments }) => DodoPayments.Checkout.close())
        .catch(() => {});
    },
    [],
  );

  const start = useCallback(() => {
    setError(null);
    setStatus((current) =>
      current === "creating" || current === "redirecting" ? current : "creating",
    );
  }, []);

  // Open the embedded form as soon as the page is ready, so paying is one less
  // click. Skipped when the customer just came back from cancelling.
  useEffect(() => {
    if (!autoStart) return;
    const timer = window.setTimeout(() => start(), 150);
    return () => window.clearTimeout(timer);
  }, [autoStart, start]);

  const reset = useCallback(() => {
    void import("dodopayments-checkout")
      .then(({ DodoPayments }) => DodoPayments.Checkout.close())
      .catch(() => {});
    setError(null);
    setStatus("idle");
  }, []);

  const value = useMemo(
    () => ({ status, error, start, reset }),
    [status, error, start, reset],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function CheckoutButton({ children }: { children: React.ReactNode }) {
  const { start, status } = useCheckout();
  const busy = status === "creating" || status === "redirecting";

  return (
    <button
      type="button"
      onClick={start}
      disabled={busy}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
    >
      {busy ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {status === "redirecting" ? "Redirecting…" : "Preparing checkout…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function CheckoutFrame({
  planName,
  price,
  unit,
}: {
  planName: string;
  price: string;
  unit: string;
}) {
  const { status, error, reset, start } = useCheckout();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === "idle") return;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status]);

  if (status === "idle") return null;

  const loading = status === "creating";

  return (
    <section
      ref={sectionRef}
      id="secure-payment"
      aria-live="polite"
      className="mt-6 scroll-mt-24 overflow-hidden rounded-card border border-line bg-surface"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Lock size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-ink">3 · Secure payment</h2>
          <span className="hidden text-sm text-ink-muted sm:inline">
            {planName} · {price} {unit}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          {status === "error" ? "Dismiss" : "Cancel"}
        </button>
      </header>

      <div className="px-4 py-5 sm:px-6">
        {error ? (
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm text-error">{error}</p>
            <button
              type="button"
              onClick={start}
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              <RotateCcw size={15} />
              Try again
            </button>
            <p className="mt-3 text-xs text-ink-muted">
              Still stuck? Email{" "}
              <a
                href="mailto:hello@yogawritecode.com"
                className="underline underline-offset-4 hover:text-ink"
              >
                hello@yogawritecode.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-surface-subtle/60 p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Loader2 size={20} className="animate-spin text-brand" />
                <p className="text-sm text-ink-secondary">Preparing secure payment…</p>
                <p className="text-xs text-ink-muted">
                  You&apos;ll enter card details right here, on this page.
                </p>
              </div>
            ) : null}
            <div id={ELEMENT_ID} className="w-full" />
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-subtle px-6 py-3 text-xs text-ink-muted">
        <ShieldCheck size={14} className="text-success" />
        <span>
          Payments are processed by Dodo Payments. Card details are entered in their secure form and
          never touch our servers.
        </span>
        <a
          href="/refund-policy"
          className="ml-auto inline-flex items-center gap-1 font-medium text-ink-secondary hover:text-ink"
        >
          Refund policy
          <ArrowRight size={12} />
        </a>
      </footer>
    </section>
  );
}
