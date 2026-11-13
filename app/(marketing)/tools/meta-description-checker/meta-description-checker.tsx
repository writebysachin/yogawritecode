"use client";

import { useState } from "react";

function getStatus(len: number): {
  label: string;
  color: "green" | "yellow" | "red";
} {
  if (len >= 150 && len <= 160) return { label: "Perfect length", color: "green" };
  if ((len >= 120 && len < 150) || (len > 160 && len <= 180))
    return { label: "Acceptable — could be better", color: "yellow" };
  return {
    label: len < 120 ? "Too short — add more detail" : "Too long — will be truncated",
    color: "red",
  };
}

const statusClasses = {
  green: { bar: "bg-success", badge: "bg-success-soft text-success border-success-soft" },
  yellow: { bar: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  red: { bar: "bg-error", badge: "bg-error-bg text-error border-red-200" },
};

const SERP_LIMIT = 160;

export function MetaDescriptionChecker() {
  const [description, setDescription] = useState("");

  const len = description.length;
  const barWidth = Math.min((len / 160) * 100, 100);
  const status = len > 0 ? getStatus(len) : null;

  return (
    <div className="space-y-6">
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Enter your meta description…"
          className="w-full resize-none rounded-field border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
          <span>{len} characters</span>
          <span>Target: 150–160</span>
        </div>
      </div>

      {status && (
        <>
          <div className="space-y-2">
            <div className="h-3 w-full overflow-hidden rounded-full border border-line bg-surface-subtle">
              <div
                className={`h-full rounded-full transition-all duration-200 ${statusClasses[status.color].bar}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status.color].badge}`}
            >
              {status.label}
            </span>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
              Google SERP preview
            </p>
            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="text-xs text-green-700">https://yoursite.com › page</p>
              <p className="mt-0.5 text-lg font-medium text-blue-700 hover:underline cursor-pointer">
                Your Page Title · Your Site
              </p>
              <p className="mt-1 text-sm leading-5 text-ink-secondary">
                {description.slice(0, SERP_LIMIT)}
                {len > SERP_LIMIT ? "…" : ""}
              </p>
            </div>
          </div>
        </>
      )}

      {!description && (
        <div className="rounded-2xl border border-line bg-surface-subtle p-8 text-center text-sm text-ink-muted">
          Enter your meta description above to check its length and preview it.
        </div>
      )}
    </div>
  );
}
