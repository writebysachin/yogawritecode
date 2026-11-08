"use client";

import { Search } from "lucide-react";

export function QuickSearchButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
        window.dispatchEvent(e);
      }}
      className="mb-2 flex w-full items-center gap-2 rounded-control px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
    >
      <Search size={16} />
      <span className="flex-1 text-left">Quick search</span>
      <kbd className="rounded border border-line bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
    </button>
  );
}
