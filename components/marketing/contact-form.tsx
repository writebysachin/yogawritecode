"use client";

import { useId, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-field border border-line bg-surface px-3.5 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-soft";

/**
 * Contact form styled with the site's own tokens. Answers are forwarded to the
 * JotForm "Website form" by /api/contact, so submissions still land in JotForm.
 */
export function ContactForm() {
  const firstId = useId();
  const lastId = useId();
  const emailId = useId();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Couldn't send your message. Please try again.");
        return;
      }

      setStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Couldn't send your message. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        aria-live="polite"
        className="mt-10 rounded-surface border border-success/25 bg-success-soft px-6 py-8"
      >
        <p className="font-heading text-lg font-semibold text-success">Thanks — we&apos;ve got it.</p>
        <p className="mt-1 text-sm text-ink-secondary">
          We reply to every message within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={firstId} className="text-sm font-medium text-ink">
            First name
          </label>
          <input
            id={firstId}
            name="firstName"
            required
            autoComplete="given-name"
            placeholder="Sachin"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={lastId} className="text-sm font-medium text-ink">
            Last name
          </label>
          <input
            id={lastId}
            name="lastName"
            autoComplete="family-name"
            placeholder="Pandey"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={emailId} className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-11 items-center justify-center rounded-field bg-brand px-6 text-sm font-semibold text-white shadow-pop transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        <p aria-live="polite" className={`text-sm text-error ${message ? "" : "sr-only"}`}>
          {message ?? ""}
        </p>
      </div>
    </form>
  );
}
