"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const opportunityRows = [
  ["Turn your website into your next five articles", "informational", "92"],
  ["Build a focused topic cluster", "informational", "88"],
  ["Create a commercial comparison page", "commercial", "88"],
  ["Develop a founder-friendly SEO guide", "commercial", "85"],
];

const navItems = [
  ["Overview", "▤", "/dashboard"],
  ["Opportunities", "◎", "/dashboard/seo"],
  ["Drafts & Editor", "✎", "/dashboard/content"],
  ["Analytics", "▥", "/dashboard/analytics"],
  ["Settings", "⚙", "/dashboard/settings"],
] as const;

const DESKTOP_WIDTH = 1080;

function WorkspaceInner() {
  return (
    <div className="flex min-h-[580px] flex-row" style={{ width: DESKTOP_WIDTH }}>
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-surface-subtle p-4">
        <div className="flex shrink-0 items-center gap-2 px-2 pb-3 font-bold text-ink">
          <Image src="/icon.svg" alt="" width={28} height={28} unoptimized />
        </div>
        <p className="px-2 pt-3 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-muted">
          Workspace
        </p>
        <nav className="mt-2 block space-y-1">
          {navItems.map(([label, icon, href], index) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                index === 0
                  ? "bg-brand-soft text-brand-hover"
                  : "text-ink-secondary hover:bg-surface hover:text-ink"
              }`}
            >
              <span className="w-4 text-center">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-line bg-surface p-3 text-xs">
          <p className="font-semibold text-ink">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />
            Design Partner Program
          </p>
          <p className="mt-2 leading-5 text-ink-secondary">
            Help shape the next version of YWC.
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-line px-7 py-3">
          <div className="flex min-w-0 max-w-xs flex-1 items-center gap-2 rounded-lg border border-line bg-surface-subtle px-3 py-2 text-xs text-ink-muted">
            <span>⌕</span>
            <span className="truncate">Search content, keywords, projects…</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand to-success text-[10px] font-bold text-white">
              YW
            </span>
            <span className="text-xs font-semibold text-ink">Your workspace</span>
          </div>
        </div>

        <div className="p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-ink">
                Welcome to your workspace <span aria-hidden="true">👋</span>
              </h3>
              <p className="mt-1 text-xs text-ink-secondary">
                Your content intelligence, in one calm place.
              </p>
            </div>
            <Link
              href="/dashboard/projects/new"
              className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white shadow-pop transition hover:bg-brand-hover"
            >
              + New project
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {[
              ["Projects", "2", "total in workspace"],
              ["Opportunities", "10", "+5 this week"],
              ["Drafts", "2", "+2 this week"],
              ["Next actions", "2", "ready to continue"],
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-xl border border-line bg-surface p-4">
                <p className="text-[11px] font-semibold text-ink-secondary">{label}</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
                <p className="mt-1 text-[10px] text-ink-muted">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-[1.5fr_1fr] gap-4">
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h4 className="text-sm font-bold text-ink">Top content opportunities</h4>
                <Link href="/dashboard/seo" className="text-xs font-semibold text-brand">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-line px-4">
                {opportunityRows.map(([title, intent, score]) => (
                  <div key={title} className="flex items-center gap-3 py-3 text-xs">
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink">{title}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        intent === "commercial"
                          ? "bg-warning-soft text-warning"
                          : "bg-brand-soft text-brand"
                      }`}
                    >
                      {intent}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-muted">Score {score}</span>
                  </div>
                ))}
              </div>
              <p className="border-t border-line px-4 py-3 text-[10px] text-ink-muted">
                Score reflects relevance, impact, and feasibility.
              </p>
            </div>

            <div className="rounded-xl border border-line p-4">
              <h4 className="text-sm font-bold text-ink">Next best actions</h4>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-brand-soft bg-brand-soft p-3 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-brand">Continue</p>
                  <p className="mt-1 font-semibold text-ink">Your next pillar topic</p>
                  <p className="mt-1 text-ink-secondary">Build a focused plan from your website.</p>
                </div>
                <div className="rounded-lg border border-brand-soft bg-brand-soft p-3 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-brand">Explore</p>
                  <p className="mt-1 font-semibold text-ink">A stronger first brief</p>
                  <p className="mt-1 text-ink-secondary">Turn an opportunity into a clear next step.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkspacePreview() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function update() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && wrapperRef.current) {
        const containerWidth = wrapperRef.current.offsetWidth;
        setScale(containerWidth / DESKTOP_WIDTH);
      } else {
        setScale(null);
      }
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (isMobile && scale !== null) {
    const scaledHeight = 580 * scale;
    return (
      <div
        ref={wrapperRef}
        className="overflow-hidden rounded-2xl border border-line bg-surface font-sans shadow-pop"
        style={{ height: scaledHeight }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: DESKTOP_WIDTH,
          }}
        >
          <WorkspaceInner />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden rounded-2xl border border-line bg-surface font-sans shadow-pop"
    >
      <WorkspaceInner />
    </div>
  );
}
