"use client";

import { useMemo } from "react";
import { analyzeReadability, gradeLabel } from "@/lib/analysis/readability";
import { analyzeSeo } from "@/lib/analysis/seo";

interface AnalysisPanelProps {
  content: string;
  title: string;
  targetKeyword: string;
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: 16,
  backgroundColor: "#FFFFFF",
};

export function AnalysisPanel({ content, title, targetKeyword }: AnalysisPanelProps) {
  const readability = useMemo(() => analyzeReadability(content), [content]);
  const seo = useMemo(
    () => analyzeSeo(content, targetKeyword, title),
    [content, targetKeyword, title],
  );
  const grade = gradeLabel(readability.gradeLevel);
  const previewComplex = readability.complexSentences.slice(0, 2);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section style={cardStyle} aria-label="Readability analysis">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          Readability
        </p>
        <p className="mt-2 text-5xl font-bold" style={{ color: grade.color }}>
          {readability.gradeLevel}
        </p>
        <p className="mt-1 text-sm font-medium" style={{ color: grade.color }}>
          {grade.label} — Grade {readability.gradeLevel}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Reading ease {readability.readingEase} · {readability.wordCount} words ·{" "}
          {readability.sentenceCount} sentences
        </p>

        <dl className="mt-4 space-y-0 text-sm">
          <div className="flex items-center justify-between border-b py-2" style={{ borderColor: "#E5E7EB" }}>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Complex sentences
            </dt>
            <dd className="text-sm text-gray-600">{readability.complexSentences.length}</dd>
          </div>
          <div className="flex items-center justify-between border-b py-2" style={{ borderColor: "#E5E7EB" }}>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Passive voice
            </dt>
            <dd className="text-sm text-gray-600">{readability.passiveSentences.length}</dd>
          </div>
          <div className="flex items-center justify-between py-2">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Adverbs
            </dt>
            <dd className="text-sm text-gray-600">{readability.adverbs.length}</dd>
          </div>
        </dl>

        {previewComplex.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Long sentences to split
            </p>
            {previewComplex.map((sentence, index) => (
              <p
                key={`${index}-${sentence.slice(0, 24)}`}
                className="rounded-md p-2 text-sm leading-6"
                style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
              >
                {sentence}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <section style={cardStyle} aria-label="SEO analysis">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          SEO Score
        </p>
        <p
          className="mt-2 text-5xl font-bold"
          style={{ color: seo.score >= 80 ? "#15803D" : seo.score >= 50 ? "#B45309" : "#B91C1C" }}
        >
          {seo.score}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {seo.checks.filter((c) => c.passed).length} of {seo.checks.length} checks passing
        </p>

        <ul className="mt-4 space-y-0">
          {seo.checks.map((check) => (
            <li
              key={check.id}
              className="flex items-start gap-2 border-b py-2 text-sm last:border-b-0"
              style={{ borderColor: "#E5E7EB" }}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: check.passed ? "#DCFCE7" : "#FEE2E2",
                  color: check.passed ? "#15803D" : "#B91C1C",
                }}
              >
                {check.passed ? "✓" : "✕"}
              </span>
              <span className={check.passed ? "text-gray-600" : "text-gray-900"}>{check.label}</span>
              <span className="sr-only">{check.passed ? "passed" : "failed"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
