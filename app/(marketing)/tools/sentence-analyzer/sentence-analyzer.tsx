"use client";

import { useState, useMemo } from "react";

const LONG_THRESHOLD = 25;
const VERY_LONG_THRESHOLD = 35;

function analyzeSentences(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const rawSentences = trimmed.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (rawSentences.length === 0) return null;

  const sentences = rawSentences.map((sentence) => {
    const words = sentence.match(/\b\w+\b/g) ?? [];
    const wordCount = words.length;
    const status: "ok" | "long" | "very-long" =
      wordCount >= VERY_LONG_THRESHOLD
        ? "very-long"
        : wordCount >= LONG_THRESHOLD
        ? "long"
        : "ok";
    return { text: sentence.trim(), wordCount, status };
  });

  const ok = sentences.filter((s) => s.status === "ok").length;
  const long = sentences.filter((s) => s.status === "long").length;
  const veryLong = sentences.filter((s) => s.status === "very-long").length;

  return { sentences, ok, long, veryLong };
}

const rowClasses = {
  ok: "border-line bg-surface",
  long: "border-yellow-200 bg-yellow-50",
  "very-long": "border-red-200 bg-error-bg",
};

const badgeClasses = {
  ok: "bg-success-soft text-success",
  long: "bg-yellow-100 text-yellow-700",
  "very-long": "bg-error-bg text-error",
};

export function SentenceAnalyzer() {
  const [text, setText] = useState("");

  const result = useMemo(() => analyzeSentences(text), [text]);

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Paste your text here…"
        className="w-full resize-y rounded-field border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />

      {result ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Total sentences", value: result.sentences.length, colorClass: "" },
              { label: "✓ Good (< 25 words)", value: result.ok, colorClass: "text-success" },
              { label: "⚠ Long (25–34)", value: result.long, colorClass: "text-yellow-600" },
              { label: "✗ Very long (35+)", value: result.veryLong, colorClass: "text-error" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-[120px] rounded-xl border border-line bg-surface px-4 py-3 text-center"
              >
                <p className={`font-heading text-2xl font-bold text-ink ${stat.colorClass}`}>
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {result.sentences.map((sentence, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${rowClasses[sentence.status]}`}
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses[sentence.status]}`}
                >
                  {sentence.wordCount}w
                </span>
                <p className="leading-6 text-ink-secondary">{sentence.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface-subtle p-8 text-center text-sm text-ink-muted">
          Paste your content above to analyze sentence lengths.
        </div>
      )}
    </div>
  );
}
