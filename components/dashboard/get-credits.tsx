"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, CreditCard, Loader2, RotateCcw, Sparkles, X, Zap } from "lucide-react";
import { claimCardBonus } from "@/app/dashboard/credits/actions";

// ── tiny inline Dodo checkout wired to the credits modal ─────────────────────

type CheckoutStatus = "idle" | "creating" | "open" | "success" | "error";
type CheckoutEvent = { event_type: string; data?: Record<string, unknown> };

const ELEMENT_ID = "credits-inline-checkout";

let sdkReady = false;
let sdkMode: "test" | "live" | null = null;
let emit: (e: CheckoutEvent) => void = () => {};

async function loadSdk(mode: "test" | "live") {
  const mod = await import("dodopayments-checkout");
  if (!sdkReady) {
    mod.DodoPayments.Initialize({
      mode,
      displayType: "inline",
      onEvent: (e) => emit(e as CheckoutEvent),
    });
    sdkReady = true;
    sdkMode = mode;
  } else if (sdkMode !== mode) {
    console.warn(`[credits checkout] SDK already in ${sdkMode} mode.`);
  }
  return mod.DodoPayments;
}

function useInlineCheckout(plan: string, cycle: string) {
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const router = useRouter();

  const handleEvent = useCallback(
    (event: CheckoutEvent) => {
      switch (event.event_type) {
        case "checkout.redirect":
        case "checkout.redirect_requested":
          // Payment done — claim the bonus
          setClaiming(true);
          claimCardBonus()
            .then(() => {
              setStatus("success");
              router.refresh();
            })
            .catch(() => {
              setStatus("success"); // credits may still be there
              router.refresh();
            })
            .finally(() => setClaiming(false));
          break;
        case "checkout.closed":
          setStatus("idle");
          break;
        case "checkout.link_expired":
          setError("Session expired. Please try again.");
          setStatus("error");
          break;
        case "checkout.error": {
          const detail = event.data?.message ?? event.data?.error;
          setError(
            typeof detail === "string" && detail.trim()
              ? detail
              : "Payment couldn't be completed. Try again.",
          );
          setStatus("error");
          break;
        }
      }
    },
    [router],
  );

  useEffect(() => {
    emit = handleEvent;
    return () => { emit = () => {}; };
  }, [handleEvent]);

  useEffect(() => {
    if (status !== "creating") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan, cycle }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          checkoutUrl?: string;
          mode?: string;
          fallbackUrl?: string;
          error?: string;
        };
        if (!res.ok || !data.checkoutUrl) {
          if (data.fallbackUrl) { window.location.assign(data.fallbackUrl); return; }
          throw new Error(data.error ?? "Checkout couldn't be prepared.");
        }
        const Dodo = await loadSdk(data.mode === "test" ? "test" : "live");
        if (cancelled) return;
        Dodo.Checkout.open({ checkoutUrl: data.checkoutUrl, elementId: ELEMENT_ID });
        setStatus("open");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Checkout couldn't be prepared.");
        setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, [status, plan, cycle]);

  const start = useCallback(() => {
    setError(null);
    setStatus((s) => (s === "creating" ? s : "creating"));
  }, []);

  const reset = useCallback(() => {
    import("dodopayments-checkout")
      .then(({ DodoPayments }) => DodoPayments.Checkout.close())
      .catch(() => {});
    setError(null);
    setStatus("idle");
  }, []);

  return { status, error, claiming, start, reset };
}

// ── main component ────────────────────────────────────────────────────────────

export function GetCredits({
  credits,
  cardClaimed,
}: {
  credits: number;
  cardClaimed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const articles = Math.floor(credits / 5);
  const { status, error, claiming, start, reset } = useInlineCheckout("pro", "monthly");

  function handleClose() {
    reset();
    setShowCheckout(false);
    setOpen(false);
  }

  function handleStartCheckout() {
    setShowCheckout(true);
    // slight delay so the container div mounts before Dodo looks it up
    setTimeout(() => start(), 80);
  }

  const checkoutActive = showCheckout && status !== "idle";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-field border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-ink"
      >
        <Zap size={14} className="text-brand" />
        {credits} credits
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Get credits"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-card border border-line bg-surface shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h2 className="font-sans text-xl font-semibold tracking-tight text-ink">
                  Your credits
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  1 credit = 1 AI step. Failed runs are refunded automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-field border border-line text-ink-secondary transition-colors hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Balance */}
              <div className="flex items-baseline gap-2 rounded-card border border-line bg-surface-subtle px-5 py-4">
                <span className="font-sans text-4xl font-semibold tracking-tight text-ink">
                  {credits}
                </span>
                <span className="text-sm text-ink-muted">
                  credits left · ≈ {articles} article{articles === 1 ? "" : "s"}
                </span>
              </div>

              {/* Card bonus section */}
              {!cardClaimed && status !== "success" && (
                <div className="rounded-card border border-brand/30 bg-brand-soft/20 p-5">
                  {!checkoutActive ? (
                    /* Prompt state */
                    <>
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="shrink-0 text-brand" />
                        <p className="text-sm font-semibold text-ink">
                          Claim 100 free credits
                        </p>
                      </div>
                      <p className="mt-1.5 text-sm text-ink-secondary">
                        Add a payment method to verify your account and instantly receive{" "}
                        <span className="font-semibold text-ink">+100 free credits</span>. No charge today — your 7-day free trial starts and you can cancel before it ends.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartCheckout}
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
                      >
                        <CreditCard size={15} />
                        Add card · get 100 free credits
                      </button>
                    </>
                  ) : (
                    /* Checkout open state */
                    <>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <CreditCard size={15} className="text-brand" />
                          <p className="text-sm font-semibold text-ink">Add payment method</p>
                          <span className="text-xs text-ink-muted">· Pro · $19/mo trial</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { reset(); setShowCheckout(false); }}
                          className="text-xs text-ink-muted underline underline-offset-4 hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Error state */}
                      {error && (
                        <div className="mb-4 rounded-lg border border-error-soft bg-error-soft px-4 py-3 text-sm text-error">
                          <p>{error}</p>
                          <button
                            type="button"
                            onClick={start}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-error underline underline-offset-4"
                          >
                            <RotateCcw size={12} /> Try again
                          </button>
                        </div>
                      )}

                      {/* Dodo iframe container */}
                      <div className="overflow-hidden rounded-lg border border-line bg-surface-subtle/60 p-2">
                        {(status === "creating" || claiming) && (
                          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <Loader2 size={20} className="animate-spin text-brand" />
                            <p className="text-sm text-ink-secondary">
                              {claiming ? "Claiming your credits…" : "Preparing secure payment…"}
                            </p>
                          </div>
                        )}
                        <div id={ELEMENT_ID} className="w-full" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Success state */}
              {(cardClaimed || status === "success") && (
                <div className="rounded-card border border-success/30 bg-success-soft/40 p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="shrink-0 text-success" />
                    <p className="text-sm font-semibold text-ink">
                      {status === "success" ? "Credits claimed! 🎉" : "Card bonus claimed ✓"}
                    </p>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-secondary">
                    {status === "success"
                      ? "+100 credits have been added to your account."
                      : "You've already claimed your card bonus. Upgrade to get more credits."}
                  </p>
                </div>
              )}

              {/* Upgrade CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface-subtle px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-brand" />
                  <p className="text-sm text-ink-secondary">
                    <span className="font-medium text-ink">Upgrade to Pro</span> for unlimited credits
                  </p>
                </div>
                <Link
                  href="/dashboard/upgrade"
                  onClick={handleClose}
                  className="text-sm font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
                >
                  See plans →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
