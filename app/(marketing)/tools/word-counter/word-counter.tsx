"use client";

import { useState, useMemo } from "react";

function computeStats(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const words = trimmed.match(/\b\w+\b/g) ?? [];
  const wordCount = words.length;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = Math.max(paragraphs.length, 1);
  const readingMinutes = Math.ceil(wordCount / 238);

  return { wordCount, charCount, charNoSpaces, sentenceCount, paragraphCount, readingMinutes };
}

export function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => computeStats(text), [text]);

  const statCards = stats
    ? [
        { label: "Words", value: stats.wordCount.toLocaleString() },
        { label: "Characters", value: stats.charCount.toLocaleString() },
        { label: "Characters (no spaces)", value: stats.charNoSpaces.toLocaleString() },
        { label: "Sentences", value: stats.sentenceCount.toLocaleString() },
        { label: "Paragraphs", value: stats.paragraphCount.toLocaleString() },
        {
          label: "Reading time",
          value: stats.readingMinutes === 1 ? "1 min" : `${stats.readingMinutes} min`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Paste or type your text here…"
        className="w-full resize-y rounded-field border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />

      {stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-line bg-surface p-4 text-center"
            >
              <p className="font-heading text-2xl font-bold text-ink">{card.value}</p>
              <p className="mt-1 text-xs text-ink-muted">{card.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface-subtle p-8 text-center text-sm text-ink-muted">
          Start typing or paste text above to see your stats.
        </div>
      )}
    </div>
  );
}
