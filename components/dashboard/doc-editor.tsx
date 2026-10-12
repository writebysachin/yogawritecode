"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  draftSection,
  improveSection,
  saveDraft,
} from "@/app/dashboard/projects/[id]/editor/actions";
import { analyzeReadability, gradeLabel } from "@/lib/analysis/readability";
import { analyzeSeo } from "@/lib/analysis/seo";

export type DocSection = {
  heading: string;
  purpose: string;
  points: string[];
  content: string;
};

function toMarkdown(title: string, sections: DocSection[]) {
  const parts = [`# ${title || "Untitled draft"}`];
  for (const s of sections) {
    parts.push(`## ${s.heading}\n\n${s.content || "_(not drafted yet)_"}`);
  }
  return parts.join("\n\n");
}

function Prose({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- ") || l.trim() === "")) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 text-[15px] leading-7 text-ink-secondary">
              {lines
                .filter((l) => l.trim().startsWith("- "))
                .map((l, j) => (
                  <li key={j}>{l.trim().slice(2)}</li>
                ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-7 text-ink-secondary">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export function DocEditor({
  draftId,
  projectId,
  initialTitle,
  sections,
}: {
  draftId: string;
  projectId: string;
  initialTitle: string;
  sections: DocSection[];
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState(initialTitle);
  const [values, setValues] = useState<string[]>(sections.map((s) => s.content));
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [targetKeyword, setTargetKeyword] = useState("");
  const [focused, setFocused] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const current = (): DocSection[] =>
    sections.map((s, i) => ({ ...s, content: values[i] ?? "" }));

  const liveMarkdown = useMemo(
    () => toMarkdown(title, current()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, values],
  );
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(liveMarkdown);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMarkdown(liveMarkdown), 400);
    return () => clearTimeout(timer);
  }, [liveMarkdown]);

  const readability = useMemo(() => analyzeReadability(debouncedMarkdown), [debouncedMarkdown]);
  const seo = useMemo(
    () => analyzeSeo(debouncedMarkdown, targetKeyword, title),
    [debouncedMarkdown, targetKeyword, title],
  );
  const grade = gradeLabel(readability.gradeLevel);
  const readingMinutes = Math.max(1, Math.round(readability.wordCount / 200));
  const seoPassed = seo.checks.filter((c) => c.passed).length;

  const sectionWords = useMemo(
    () => values.map((v) => (v.match(/[A-Za-z0-9']+/g) ?? []).length),
    [values],
  );
  const draftedCount = sectionWords.filter((n) => n > 0).length;

  const runAI = (index: number, aiMode: "draft" | "improve") => {
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("heading", sections[index].heading);
    formData.set("purpose", sections[index].purpose);
    formData.set("points", JSON.stringify(sections[index].points));
    if (aiMode === "improve") formData.set("current", values[index]);

    setBusy(index);
    setNotice(null);
    startTransition(async () => {
      const res =
        aiMode === "draft" ? await draftSection(formData) : await improveSection(formData);
      if (res.ok && typeof res.text === "string") {
        setValues((old) => old.map((v, i) => (i === index ? res.text! : v)));
      } else {
        setNotice(res.error ?? "AI request failed.");
      }
      setBusy(null);
    });
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown(title, current()));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setNotice("Couldn't access the clipboard.");
    }
  };

  const tabClass = (active: boolean) =>
    active
      ? "rounded-control bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand"
      : "rounded-control px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink";

  return (
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <form action={saveDraft} className="min-w-0">
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input
        type="hidden"
        name="meta"
        value={JSON.stringify(
          sections.map(({ heading, purpose, points }) => ({ heading, purpose, points }))
        )}
      />
      {sections.map((_, i) => (
        <input key={i} type="hidden" name={`section-${i}`} value={values[i] ?? ""} />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMode("write")} className={tabClass(mode === "write")}>
            Write
          </button>
          <button type="button" onClick={() => setMode("preview")} className={tabClass(mode === "preview")}>
            Preview
          </button>
          <span className="ml-2 hidden text-xs text-ink-muted sm:inline">
            {draftedCount} of {sections.length} drafted · {readability.wordCount.toLocaleString()} words
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyMarkdown}
            className="inline-flex h-9 items-center rounded-field border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-subtle"
          >
            {copied ? "Copied!" : "Copy markdown"}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 items-center rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-line bg-surface px-8 py-10 sm:px-12">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          name="title"
          placeholder="Untitled draft"
          className="font-sans w-full border-0 bg-transparent text-3xl font-semibold tracking-tight text-ink focus:outline-none"
        />

        {sections.length > 1 ? (
          <nav aria-label="Sections" className="mt-4 flex flex-wrap gap-2">
            {sections.map((s, i) => (
              <a
                key={`nav-${s.heading}-${i}`}
                href={`#doc-section-${i}`}
                className="rounded-control border border-line px-2.5 py-1 text-xs font-medium text-ink-secondary transition-colors hover:border-brand hover:text-brand"
              >
                {String(i + 1).padStart(2, "0")} · {(s.heading || "Untitled").slice(0, 28)}
              </a>
            ))}
          </nav>
        ) : null}

        {mode === "write" ? (
          <div className="mt-6 space-y-4">
          {sections.map((s, i) => {
            const words = sectionWords[i] ?? 0;
            const isActive = focused === i;
            return (
            <section
              key={s.heading + i}
              id={`doc-section-${i}`}
              className={
                isActive
                  ? "scroll-mt-24 rounded-card border-2 border-brand bg-surface p-5 transition-colors"
                  : "scroll-mt-24 rounded-card border border-line bg-surface-subtle/50 p-5 transition-colors"
              }
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-brand-soft text-xs font-bold text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-sans min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-ink">
                  {s.heading}
                </h2>
                <span
                  className={
                    words > 0
                      ? "inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-secondary"
                      : "inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-muted"
                  }
                >
                  <span
                    className={words > 0 ? "h-1.5 w-1.5 rounded-full bg-success" : "h-1.5 w-1.5 rounded-full bg-line"}
                  />
                  {words > 0 ? `${words.toLocaleString()} words` : "Empty"}
                </span>
              </div>
              {s.purpose ? <p className="mt-1.5 text-xs leading-5 text-ink-muted">{s.purpose}</p> : null}
              <textarea
                rows={Math.max(6, (values[i] ?? "").split("\n").length + 2)}
                value={values[i] ?? ""}
                onChange={(e) =>
                  setValues((old) => old.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                onFocus={() => setFocused(i)}
                onBlur={() => setFocused((old) => (old === i ? null : old))}
                placeholder="Write here, or let AI draft this section."
                className="mt-3 w-full resize-y rounded-control border border-transparent bg-transparent px-3 py-2 text-[15px] leading-7 text-ink-secondary focus:border-line focus:bg-surface focus:outline-none"
              />
              <div className="mt-1 flex items-center gap-4 px-3">
                <button
                  type="button"
                  disabled={busy === i}
                  onClick={() => runAI(i, "draft")}
                  className="text-xs font-medium text-brand underline underline-offset-4 hover:text-brand-hover disabled:opacity-50"
                >
                  {busy === i ? "Working…" : "Draft with AI"}
                </button>
                <button
                  type="button"
                  disabled={busy === i || !values[i]}
                  onClick={() => runAI(i, "improve")}
                  className="text-xs font-medium text-brand underline underline-offset-4 hover:text-brand-hover disabled:opacity-50"
                >
                  Rewrite with AI
                </button>
              </div>
            </section>
            );
          })}
          </div>
        ) : (
          <article className="mt-6 space-y-4">
            {current().map((s, i) => (
              <section key={s.heading + i} id={`doc-section-${i}`} className="scroll-mt-24 rounded-card border border-line bg-surface-subtle/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-brand-soft text-xs font-bold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-sans min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-ink">
                    {s.heading}
                  </h2>
                </div>
                <div className="mt-3">
                  <Prose text={s.content} />
                </div>
              </section>
            ))}
          </article>
        )}
      </div>

      {notice ? (
        <p className="mt-3 rounded-control border-l-2 border-error bg-error-soft px-3 py-2 text-sm text-error">
          {notice}
        </p>
      ) : null}
      </form>

      <aside className="min-w-0 space-y-4 xl:sticky xl:top-6" aria-label="Writing insights">
        <section className="rounded-card border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Target keyword
          </p>
          <input
            type="text"
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            placeholder="e.g. content planning"
            className="mt-2 h-10 w-full rounded-field border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
          />
        </section>

        <section className="rounded-card border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Word count
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">
            {readability.wordCount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Reading time {readingMinutes} min · {readability.sentenceCount} sentences
          </p>
        </section>

        <section className="rounded-card border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Readability
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight" style={{ color: grade.color }}>
            {readability.gradeLevel}
          </p>
          <p className="mt-1 text-xs font-medium" style={{ color: grade.color }}>
            {grade.label} — Grade {readability.gradeLevel}
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-ink-secondary">
            <li className="flex items-center justify-between">
              <span>Complex sentences</span>
              <span className="font-semibold text-ink">{readability.complexSentences.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Passive voice</span>
              <span className="font-semibold text-ink">{readability.passiveSentences.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Adverbs</span>
              <span className="font-semibold text-ink">{readability.adverbs.length}</span>
            </li>
          </ul>
          {readability.complexSentences.slice(0, 2).map((sentence, index) => (
            <p
              key={`${index}-${sentence.slice(0, 24)}`}
              className="mt-2 rounded-control bg-error-soft p-2 text-xs leading-5 text-error"
            >
              {sentence}
            </p>
          ))}
        </section>

        <section className="rounded-card border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            SEO score
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{seo.score}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {seoPassed} of {seo.checks.length} checks passing
          </p>
          <ul className="mt-3 space-y-1.5">
            {seo.checks.map((check) => (
              <li key={check.id} className="flex items-start gap-2 text-xs">
                <span
                  aria-hidden="true"
                  className={
                    check.passed
                      ? "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-[10px] font-bold text-success"
                      : "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-error-soft text-[10px] font-bold text-error"
                  }
                >
                  {check.passed ? "✓" : "✕"}
                </span>
                <span className={check.passed ? "text-ink-secondary" : "text-ink"}>{check.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}