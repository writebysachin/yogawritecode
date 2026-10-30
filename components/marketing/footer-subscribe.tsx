"use client";

import { useId, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Footer newsletter signup: a plain email input and button, styled with the
 * site's own tokens instead of a third-party iframe.
 *
 * The address is posted to /api/newsletter, which forwards it to Substack, so a
 * failure can be shown inline rather than silently doing nothing.
 */
export function FooterSubscribe() {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Couldn't sign you up right now. Please try again.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Couldn't sign you up right now. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
      <div className="max-w-md">
        <h2 className="font-heading text-lg font-semibold text-ink">
          Get one useful idea every week
        </h2>
        <p className="mt-1 text-sm leading-6 text-ink-secondary">
          Practical notes on AI content systems. No spam, unsubscribe anytime.
        </p>
      </div>

      {status === "success" ? (
        <p
          aria-live="polite"
          className="rounded-field border border-success/25 bg-success-soft px-4 py-3 text-sm text-success sm:max-w-[420px]"
        >
          You&apos;re in — check your inbox to confirm your subscription.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full sm:max-w-[420px]">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <input
              id={inputId}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setMessage(null);
                }
              }}
              className="h-10 w-full min-w-0 rounded-field border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-soft"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-field bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
            >
              {status === "submitting" ? "Subscribing…" : "Subscribe"}
            </button>
          </div>

          <p
            aria-live="polite"
            className={`mt-2 text-sm text-error ${message ? "" : "sr-only"}`}
          >
            {message ?? ""}
          </p>
        </form>
      )}
    </div>
  );
}
