"use client";

import Link from "next/link";
import { useState } from "react";
import { CreditCard, Sparkles, X, Zap } from "lucide-react";

export function GetCredits({
  credits,
  cardClaimed,
}: {
  credits: number;
  cardClaimed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const articles = Math.floor(credits / 5);

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

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Get credits"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-card border border-line bg-surface p-7 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
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
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-field border border-line text-ink-secondary transition-colors hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            {/* Balance */}
            <div className="mt-5 flex items-baseline gap-2 rounded-card border border-line bg-surface-subtle px-5 py-4">
              <span className="font-sans text-4xl font-semibold tracking-tight text-ink">
                {credits}
              </span>
              <span className="text-sm text-ink-muted">
                credits left · ≈ {articles} article{articles === 1 ? "" : "s"}
              </span>
            </div>

            {/* Claim card bonus */}
            <div className="mt-4 rounded-card border border-brand/30 bg-brand-soft/20 p-5">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="shrink-0 text-brand" />
                <p className="text-sm font-semibold text-ink">
                  {cardClaimed ? "Card bonus claimed ✓" : "Claim 100 free credits"}
                </p>
              </div>
              {cardClaimed ? (
                <p className="mt-1.5 text-sm text-ink-secondary">
                  You&apos;ve already claimed your card bonus. Upgrade to get more credits.
                </p>
              ) : (
                <>
                  <p className="mt-1.5 text-sm text-ink-secondary">
                    Add a payment method to verify your account and instantly receive{" "}
                    <span className="font-semibold text-ink">+100 free credits</span>. No charge
                    today.
                  </p>
                  <Link
                    href="/dashboard/upgrade?autostart=1"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
                  >
                    <CreditCard size={15} />
                    Add card to claim 100 credits
                  </Link>
                  <p className="mt-2 text-xs text-ink-muted">
                    Your 7-day free trial starts — cancel before it ends and you won&apos;t be charged.
                  </p>
                </>
              )}
            </div>

            {/* Upgrade CTA */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand" />
                <p className="text-sm text-ink-secondary">
                  <span className="font-medium text-ink">Upgrade to Pro</span> for unlimited credits
                </p>
              </div>
              <Link
                href="/dashboard/upgrade"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
              >
                See plans →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
