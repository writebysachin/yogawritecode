"use client";

import { useEffect, useState } from "react";
import { AnalysisPanel } from "@/components/editor/analysis-panel";

interface EditorAnalysisProps {
  initialTitle: string;
  initialContent: string;
}

export function EditorAnalysis({ initialTitle, initialContent }: EditorAnalysisProps) {
  const [title, setTitle] = useState<string>(initialTitle);
  const [targetKeyword, setTargetKeyword] = useState<string>("");
  const [content, setContent] = useState<string>(initialContent);
  const [debouncedContent, setDebouncedContent] = useState<string>(initialContent);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 400);
    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div className="mt-8 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="editor-analysis-title" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Title
          </label>
          <input
            id="editor-analysis-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label htmlFor="editor-analysis-keyword" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Target keyword
          </label>
          <input
            id="editor-analysis-keyword"
            type="text"
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            placeholder="e.g. content planning"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div>
        <label htmlFor="editor-analysis-content" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          Content
        </label>
        <textarea
          id="editor-analysis-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write or paste your article here (markdown supported)…"
          rows={14}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <AnalysisPanel content={debouncedContent} title={title} targetKeyword={targetKeyword} />
    </div>
  );
}
