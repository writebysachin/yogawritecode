"use client";

import { useId, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

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

  if (status === "success") {
    return (
      <p
        aria-live="polite"
        className="rounded-field border border-success/25 bg-success-soft px-4 py-2.5 text-sm text-success"
      >
        You&apos;re in — check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex gap-2">
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
          {status === "submitting" ? "…" : "Subscribe"}
        </button>
      </div>
      {message ? (
        <p aria-live="polite" className="mt-1.5 text-xs text-error">
          {message}
        </p>
      ) : null}
    </form>
  );
}
