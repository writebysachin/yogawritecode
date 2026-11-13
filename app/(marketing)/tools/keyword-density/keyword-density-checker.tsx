"use client";

import { useState, useMemo } from "react";

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "it", "in", "on", "at", "to", "of", "and", "or",
  "but", "for", "with", "this", "that", "was", "are", "as", "by", "from",
  "has", "have", "he", "she", "they", "we", "you", "i", "be", "been",
  "being", "do", "did", "does", "not", "so", "if", "its", "their", "there",
  "then", "than", "when", "which", "who", "will", "would", "could", "should",
  "may", "might", "can", "all", "any", "some", "one", "two", "three", "more",
  "also", "just", "about", "up", "out", "into", "over",
]);

function analyzeKeywords(text: string, targetKeyword: string) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  const totalWords = words.length;
  if (totalWords === 0) return { rows: [], totalWords };

  if (targetKeyword.trim()) {
    const kw = targetKeyword.trim().toLowerCase();
    const count = words.filter((w) => w === kw).length;
    const density = ((count / totalWords) * 100).toFixed(2);
    return { rows: [{ keyword: kw, count, density }], totalWords };
  }

  const freq: Record<string, number> = {};
  for (const word of words) {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      freq[word] = (freq[word] ?? 0) + 1;
    }
  }

  const rows = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: ((count / totalWords) * 100).toFixed(2),
    }));

  return { rows, totalWords };
}

export function KeywordDensityChecker() {
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");

  const result = useMemo(() => {
    if (!text.trim()) return null;
    return analyzeKeywords(text, keyword);
  }, [text, keyword]);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Paste your content here…"
        className="w-full resize-y rounded-field border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Target keyword (optional — leave empty for top 10)"
        className="w-full rounded-field border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />

      {result ? (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between border-b border-line bg-surface-subtle px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
              {keyword.trim() ? "Keyword analysis" : "Top 10 keywords"}
            </p>
            <p className="text-xs text-ink-muted">{result.totalWords.toLocaleString()} total words</p>
          </div>
          {result.rows.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">
              No significant keywords found. Try adding more text.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
                    Keyword
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
                    Count
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
                    Density
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {result.rows.map((row) => (
                  <tr key={row.keyword}>
                    <td className="px-4 py-3 font-medium text-ink">{row.keyword}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{row.count}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{row.density}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface-subtle p-8 text-center text-sm text-ink-muted">
          Paste your content above to analyze keyword density.
        </div>
      )}
    </div>
  );
}
