"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { claimCardBonus } from "@/app/dashboard/credits/actions";

export function GetCredits({
  credits,
  cardClaimed,
}: {
  credits: number;
  cardClaimed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const articles = Math.floor(credits / 5);

  function handleClaim() {
    setMessage(null);
    startTransition(async () => {
      const res = await claimCardBonus();
      setMessage(res.message);
      if (res.ok) setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 shrink-0 items-center rounded-field border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-ink"
      >
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
            className="w-full max-w-lg rounded-card border border-line bg-surface p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-ink">
                Get credits
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-field border border-line text-ink-secondary transition-colors hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-sans text-5xl font-semibold tracking-tight text-ink">
                {credits}
              </span>
              <span className="text-sm text-ink-muted">
                credits · ≈ {articles} article{articles === 1 ? "" : "s"}
              </span>
            </p>
            <p className="mt-3 text-sm leading-6 text-ink-secondary">
              1 credit = 1 AI step. You&apos;re charged for real output only; stopped or
              failed runs are refunded.
            </p>

            <div className="mt-6 rounded-card border border-line p-5">
              <p className="text-sm font-semibold text-ink">Claim 100 free credits</p>
              <p className="mt-1 text-sm text-ink-secondary">
                One quick card check keeps YWC free of bots.
              </p>
              {cardClaimed ? (
                <p className="mt-3 text-sm font-medium text-success">
                  Card bonus already claimed.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={pending}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
                >
                  {pending ? "Claiming…" : "Add card to claim"}
                </button>
              )}
              <p className="mt-3 text-xs text-ink-muted">
                No charge for the check. Set your Dodo checkout links to enable live
                verification.
              </p>
              {message ? <p className="mt-2 text-xs text-ink-secondary">{message}</p> : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-xs text-ink-muted">
                Need more? Starter $9 · Pro $19 · Scale $40.
              </p>
              <Link
                href="/dashboard/pricing"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-brand underline underline-offset-4"
              >
                See plans
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
