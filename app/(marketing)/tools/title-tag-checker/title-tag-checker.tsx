"use client";

import { useState } from "react";

function getStatus(len: number): {
  label: string;
  color: "green" | "yellow" | "red";
} {
  if (len >= 50 && len <= 60) return { label: "Great length", color: "green" };
  if ((len >= 40 && len < 50) || (len > 60 && len <= 70))
    return { label: "Acceptable — could be better", color: "yellow" };
  return { label: len < 40 ? "Too short" : "Too long — may be truncated", color: "red" };
}

const statusClasses = {
  green: { bar: "bg-success", badge: "bg-success-soft text-success border-success-soft" },
  yellow: { bar: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  red: { bar: "bg-error", badge: "bg-error-bg text-error border-red-200" },
};

const MAX_DISPLAY_CHARS = 70;

export function TitleTagChecker() {
  const [title, setTitle] = useState("");

  const len = title.length;
  const approxPixels = Math.round(len * 6);
  const maxPixels = 60 * 6;
  const barWidth = Math.min((approxPixels / maxPixels) * 100, 100);
  const status = len > 0 ? getStatus(len) : null;

  return (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your page title…"
          className="w-full rounded-field border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
          <span>{len} characters</span>
          <span>~{approxPixels}px (target: ~360px)</span>
        </div>
      </div>

      {status && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Pixel width estimate</span>
              <span>60-char limit</span>
            </div>
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
              <p className="mt-0.5 cursor-pointer truncate text-lg font-medium text-blue-700 hover:underline">
                {title.slice(0, MAX_DISPLAY_CHARS) || "Your page title will appear here"}
                {len > MAX_DISPLAY_CHARS ? "…" : ""}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink-secondary">
                Your meta description will appear here. Write a compelling summary in 150–160 characters to improve click-through rates from search results.
              </p>
            </div>
          </div>
        </>
      )}

      {!title && (
        <div className="rounded-2xl border border-line bg-surface-subtle p-8 text-center text-sm text-ink-muted">
          Enter your title above to check its length and preview how it looks in Google.
        </div>
      )}
    </div>
  );
}
