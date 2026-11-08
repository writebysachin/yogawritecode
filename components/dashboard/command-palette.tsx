"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CreditCard, FileText, LayoutGrid, Search, Settings, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const items: { label: string; sub: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview",       sub: "Dashboard home",          href: "/dashboard",              icon: LayoutGrid },
  { label: "New project",    sub: "Create a content plan",   href: "/dashboard/projects/new", icon: Sparkles   },
  { label: "Opportunities",  sub: "All content opportunities",href: "/dashboard/seo",          icon: Search     },
  { label: "Drafts & Editor",sub: "Write and edit drafts",   href: "/dashboard/content",      icon: FileText   },
  { label: "Analytics",      sub: "Workspace stats",         href: "/dashboard/analytics",    icon: BarChart3  },
  { label: "Settings",       sub: "Account settings",        href: "/dashboard/settings",     icon: Settings   },
  { label: "Billing",        sub: "Credits and plan",        href: "/dashboard/pricing",      icon: CreditCard },
  { label: "Upgrade",        sub: "Unlock more features",    href: "/dashboard/upgrade",      icon: Sparkles   },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.sub.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) {
        setOpen(false);
        router.push(item.href);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_64px_rgb(28_25_23/0.18)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={16} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages…"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder-ink-muted outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-line bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-ink-muted sm:block">
            ESC
          </kbd>
        </div>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">No results for &ldquo;{query}&rdquo;</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto py-2">
            {filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); router.push(item.href); }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === activeIndex ? "bg-brand-soft" : "hover:bg-surface-subtle"
                    }`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${i === activeIndex ? "bg-brand text-white" : "bg-surface-subtle text-ink-secondary"}`}>
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-medium ${i === activeIndex ? "text-brand" : "text-ink"}`}>{item.label}</span>
                      <span className="block text-xs text-ink-muted">{item.sub}</span>
                    </span>
                    {i === activeIndex && (
                      <kbd className="shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                        ↵
                      </kbd>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t border-line px-4 py-2 flex items-center gap-4 text-[10px] text-ink-muted">
          <span><kbd className="rounded border border-line bg-surface-subtle px-1 py-0.5 font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="rounded border border-line bg-surface-subtle px-1 py-0.5 font-mono">↵</kbd> open</span>
          <span><kbd className="rounded border border-line bg-surface-subtle px-1 py-0.5 font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
