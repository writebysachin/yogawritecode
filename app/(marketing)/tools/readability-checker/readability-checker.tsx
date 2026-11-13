"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  const matches = cleaned.match(/[aeiou]+/g);
  return Math.max(matches ? matches.length : 1, 1);
}

function getGrade(score: number): { label: string; color: "green" | "yellow" | "red" } {
  if (score >= 90) return { label: "Very Easy (Grade 5)", color: "green" };
  if (score >= 80) return { label: "Easy (Grade 6)", color: "green" };
  if (score >= 70) return { label: "Fairly Easy (Grade 7)", color: "green" };
  if (score >= 60) return { label: "Standard (Grade 8–9)", color: "green" };
  if (score >= 50) return { label: "Fairly Difficult (Grade 10–12)", color: "yellow" };
  if (score >= 40) return { label: "Fairly Difficult (Grade 10–12)", color: "yellow" };
  if (score >= 30) return { label: "Difficult (College)", color: "yellow" };
  return { label: "Very Confusing (College Graduate)", color: "red" };
}

const badgeClasses = {
  green: "bg-success-soft text-success border-success-soft",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  red: "bg-error-bg text-error border-red-200",
};

export function ReadabilityChecker() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const words = trimmed.match(/\b\w+\b/g) ?? [];
    const wordCount = words.length;
    if (wordCount === 0) return null;

    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = Math.max(sentences.length, 1);

    const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

    const rawScore =
      206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    const avgWordsPerSentence = Math.round(wordCount / sentenceCount);
    const grade = getGrade(score);

    return { score, grade, wordCount, sentenceCount, avgWordsPerSentence };
  }, [text]);

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Paste your article text here…"
        className="w-full rounded-field border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-y"
      />

      {stats ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface-subtle p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-ink font-heading">{stats.score}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">FK Score</p>
              </div>
              <div className="flex-1">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${badgeClasses[stats.grade.color]}`}
                >
                  {stats.grade.label}
                </span>
                <p className="mt-2 text-xs text-ink-muted">
                  Flesch-Kincaid Reading Ease · Higher is easier to read
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Words", value: stats.wordCount.toLocaleString() },
              { label: "Sentences", value: stats.sentenceCount.toLocaleString() },
              { label: "Avg words / sentence", value: stats.avgWordsPerSentence },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-line bg-surface p-4 text-center">
                <p className="text-2xl font-bold text-ink font-heading">{stat.value}</p>
                <p className="mt-1 text-xs text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface-subtle p-8 text-center text-sm text-ink-muted">
          Paste some text above to see your readability score.
        </div>
      )}
    </div>
  );
}
