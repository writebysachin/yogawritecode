import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GenerateButton } from "@/components/dashboard/generate-button";
import { OpportunitySerp } from "@/components/dashboard/opportunity-serp";
import { PageHeader } from "@/components/page-header";
import { decodeEntities } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeWebsite, generateBrief, generateCluster, generateOutline } from "./actions";

export const metadata: Metadata = { title: "Project" };

const d = decodeEntities;

function safeText(value: unknown, fallback = "Not available"): string {
  if (typeof value === "string" && value.trim().length > 0) {
    try {
      return d(value);
    } catch {
      return value;
    }
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        return toStringList(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return trimmed
      .split(/[•\n;]+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
  return [];
}

type OutlineSection = { heading: string; points: string[] };

function toOutlineSections(value: unknown): OutlineSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return { heading: entry, points: [] };
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const heading =
          typeof record.heading === "string"
            ? record.heading
            : typeof record.title === "string"
              ? record.title
              : "";
        if (!heading.trim()) return null;
        return { heading, points: toStringList(record.points) };
      }
      return null;
    })
    .filter((entry): entry is OutlineSection => entry !== null);
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// ── Step progress stepper ────────────────────────────────────────────────────

type StepState = "done" | "active" | "pending";

interface StepDef {
  label: string;
  href: string;
  state: StepState;
}

function StepProgress({ steps }: { steps: StepDef[] }) {
  return (
    <nav aria-label="Workflow progress" className="mt-6">
      {/* Desktop: horizontal stepper with connector lines */}
      <ol className="hidden sm:flex items-center">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const connectorDone = step.state === "done";

          return (
            <li key={step.href} className="flex items-center">
              <a
                href={step.href}
                className={[
                  "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  step.state === "done"
                    ? "border-brand bg-brand-soft text-brand"
                    : step.state === "active"
                      ? "border-brand bg-surface text-brand"
                      : "border-line bg-surface-subtle text-ink-muted",
                ].join(" ")}
              >
                {/* Step number circle */}
                <span
                  className={[
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                    step.state === "done"
                      ? "bg-brand text-white"
                      : step.state === "active"
                        ? "border-2 border-brand bg-surface text-brand"
                        : "bg-surface-subtle text-ink-muted",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {step.state === "done" ? "✓" : i + 1}
                </span>
                {step.label}
              </a>

              {/* Connector */}
              {!isLast && (
                <span
                  className={[
                    "mx-1.5 h-px w-6 shrink-0 transition-colors",
                    connectorDone ? "bg-brand" : "bg-line",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: wrapping pills, no connectors */}
      <ol className="flex sm:hidden flex-wrap gap-2">
        {steps.map((step, i) => (
          <li key={step.href}>
            <a
              href={step.href}
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                step.state === "done"
                  ? "border-brand bg-brand-soft text-brand"
                  : step.state === "active"
                    ? "border-brand bg-surface text-brand"
                    : "border-line bg-surface-subtle text-ink-muted",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                  step.state === "done"
                    ? "bg-brand text-white"
                    : step.state === "active"
                      ? "border-2 border-brand bg-surface text-brand"
                      : "bg-surface-subtle text-ink-muted",
                ].join(" ")}
                aria-hidden="true"
              >
                {step.state === "done" ? "✓" : i + 1}
              </span>
              {step.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────

function Section({
  id,
  step,
  title,
  isActive,
  isDone,
  children,
}: {
  id: string;
  step: number;
  title: string;
  isActive?: boolean;
  isDone?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={[
        "mt-10 scroll-mt-24 rounded-card border bg-surface p-6 sm:p-8",
        isActive ? "border-brand/40" : "border-line",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={[
            "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
            isDone
              ? "bg-brand text-white"
              : isActive
                ? "border-2 border-brand bg-surface text-brand"
                : "bg-surface-subtle text-ink-muted",
          ].join(" ")}
          aria-hidden="true"
        >
          {isDone ? "✓" : step}
        </span>
        <p
          className={[
            "text-xs font-medium uppercase tracking-[0.14em]",
            isDone ? "text-brand" : isActive ? "text-brand" : "text-ink-muted",
          ].join(" ")}
        >
          Step {step} of 5
        </p>
      </div>
      <h2 className="font-sans mt-1.5 text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4 max-w-2xl">{children}</div>
    </section>
  );
}

// ── Data display helpers ─────────────────────────────────────────────────────

function FactRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="py-4 border-b border-line last:border-0">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <p className="mt-1.5 text-[15px] leading-7 text-ink-secondary">{safeText(value)}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="mt-1.5 text-sm leading-6 text-ink-muted">Not available yet.</p>;
  }
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] leading-7 text-ink-secondary">
          <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{safeText(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function ListBlock({ label, items }: { label: string; items: unknown }) {
  return (
    <div className="py-4 border-b border-line last:border-0">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <BulletList items={toStringList(items)} />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface ProjectPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  const [analysisRes, opportunitiesRes, clusterRes, briefRes, outlineRes] = await Promise.all([
    supabase.from("website_analyses").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("content_opportunities").select("*").eq("project_id", id).order("opportunity_score", { ascending: false }),
    supabase.from("topic_clusters").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("seo_briefs").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("article_outlines").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const analysis = analysisRes.data;
  const opportunities = opportunitiesRes.data ?? [];
  const cluster = clusterRes.data;
  const brief = briefRes.data;
  const outline = outlineRes.data;
  const firstOpportunityId = opportunities[0]?.id ?? "";
  const activeOpportunityId = cluster?.opportunity_id ?? firstOpportunityId;
  const dataError = [
    analysisRes.error,
    opportunitiesRes.error,
    clusterRes.error,
    briefRes.error,
    outlineRes.error,
  ].find(Boolean);

  if (dataError) {
    console.error("[project page] workflow query failed", dataError);
  }

  // Derive step states for the stepper
  const stepStates = (() => {
    const doneFlags = [
      !!analysis,
      opportunities.length > 0,
      !!cluster,
      !!brief,
      !!outline,
    ];
    const firstIncomplete = doneFlags.findIndex((d) => !d);
    return doneFlags.map((done, i): StepState => {
      if (done) return "done";
      if (i === firstIncomplete) return "active";
      return "pending";
    });
  })();

  const stepDefs: StepDef[] = [
    { label: "Analyze",       href: "#analysis",      state: stepStates[0] },
    { label: "Opportunities", href: "#opportunities",  state: stepStates[1] },
    { label: "Cluster",       href: "#cluster",        state: stepStates[2] },
    { label: "Brief",         href: "#brief",          state: stepStates[3] },
    { label: "Outline",       href: "#outline",        state: stepStates[4] },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader title={project.name} description={project.website_url} />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Error: {safeDecode(error)}</p>
        </div>
      )}

      {dataError && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Some workflow data could not be loaded. Check the database migration and try again.
        </div>
      )}

      <StepProgress steps={stepDefs} />

      {/* STEP 1 — Website analysis */}
      <Section
        id="analysis"
        step={1}
        title="Website analysis"
        isDone={!!analysis}
        isActive={stepStates[0] === "active"}
      >
        {analysis ? (
          <div className="max-w-2xl">
            <FactRow label="Company summary" value={analysis.company_summary} />
            <FactRow label="Product category" value={analysis.product_category} />
            <FactRow label="Target audience" value={analysis.target_audience} />
            <FactRow label="Positioning" value={analysis.positioning} />
          </div>
        ) : (
          <div className="rounded-lg border border-brand/20 bg-brand-soft/40 p-5">
            <p className="mb-4 text-sm text-ink-secondary">
              Start by analyzing your website. This gives us the context needed for every step that follows.
            </p>
            <GenerateButton
              action={analyzeWebsite}
              label="Analyze Website"
              pendingLabel="Analyzing…"
              hiddenFields={{ projectId: id }}
            />
          </div>
        )}
      </Section>

      {/* STEP 2 — Content opportunities */}
      {analysis && (
        <Section
          id="opportunities"
          step={2}
          title="Content opportunities"
          isDone={opportunities.length > 0}
          isActive={stepStates[1] === "active"}
        >
          {opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <article key={opp.id} className="rounded-lg border border-line bg-surface-subtle p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold leading-7 text-ink">{safeText(opp.title, "Untitled opportunity")}</h3>
                      {opp.description ? <p className="mt-1.5 text-[15px] leading-7 text-ink-secondary">{safeText(opp.description)}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-surface border border-line px-2.5 py-1 font-medium text-ink-secondary">Score: {typeof opp.opportunity_score === "number" ? opp.opportunity_score : "—"}</span>
                        {opp.difficulty ? <span className="rounded-full bg-surface border border-line px-2.5 py-1 text-ink-muted">{safeText(opp.difficulty)}</span> : null}
                        {opp.search_intent ? <span className="rounded-full bg-surface border border-line px-2.5 py-1 text-ink-muted">{safeText(opp.search_intent)}</span> : null}
                      </div>
                      {opp.reason && <p className="mt-3 border-l-2 border-brand/40 pl-3 text-sm leading-6 text-ink-secondary"><strong className="font-medium text-ink">Why it matters: </strong>{safeText(opp.reason)}</p>}
                      <OpportunitySerp
                        targetKeywords={opp.target_keywords}
                        keywordGaps={opp.keyword_gaps}
                        fallbackTitle={typeof opp.title === "string" ? opp.title : ""}
                        defaultExpanded={false}
                      />
                    </div>
                    {!cluster && (
                      <div className="shrink-0">
                        <GenerateButton
                          action={generateCluster}
                          label="Build Cluster"
                          pendingLabel="Building…"
                          hiddenFields={{ projectId: id, opportunityId: opp.id }}
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-surface-subtle p-8 text-center">
              <p className="text-ink-muted">
                {analysis
                  ? "No opportunities were generated. Re-run the analysis to try again."
                  : "Analyze the website to generate content opportunities."}
              </p>
              {analysis && (
                <div className="mt-4">
                  <GenerateButton
                    action={analyzeWebsite}
                    label="Re-run analysis"
                    pendingLabel="Analyzing…"
                    hiddenFields={{ projectId: id }}
                  />
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* STEP 3 — Topic cluster */}
      {cluster && (
        <Section
          id="cluster"
          step={3}
          title="Topic cluster"
          isDone={!!cluster}
          isActive={stepStates[2] === "active"}
        >
          <div>
            <FactRow label="Pillar topic" value={cluster.pillar_topic} />
            <ListBlock label={`Supporting topics (${toStringList(cluster.supporting_topics).length})`} items={cluster.supporting_topics} />
            {cluster.search_intent ? <FactRow label="Search intent" value={cluster.search_intent} /> : null}
            <ListBlock label="Internal linking suggestions" items={cluster.internal_linking_suggestions} />
          </div>
          {!brief && activeOpportunityId && (
            <div className="mt-4">
              <GenerateButton
                action={generateBrief}
                label="Generate SEO Brief"
                pendingLabel="Generating brief…"
                hiddenFields={{ projectId: id, opportunityId: activeOpportunityId }}
              />
            </div>
          )}
        </Section>
      )}

      {/* STEP 4 — SEO brief */}
      {brief && (
        <Section
          id="brief"
          step={4}
          title="SEO brief"
          isDone={!!brief}
          isActive={stepStates[3] === "active"}
        >
          <div>
            <FactRow label="Primary keyword" value={brief.primary_keyword} />
            {brief.search_intent ? <FactRow label="Search intent" value={brief.search_intent} /> : null}
            {brief.target_audience ? <FactRow label="Target audience" value={brief.target_audience} /> : null}
            <ListBlock label={`Suggested headings (${toStringList(brief.suggested_headings).length})`} items={brief.suggested_headings} />
            <ListBlock label="Questions to answer" items={brief.questions_to_answer} />
            <ListBlock label="Entities to mention" items={brief.entities_to_mention} />
          </div>
          {!outline && activeOpportunityId && (
            <div className="mt-4">
              <GenerateButton
                action={generateOutline}
                label="Generate Outline"
                pendingLabel="Generating outline…"
                hiddenFields={{ projectId: id, opportunityId: activeOpportunityId }}
              />
            </div>
          )}
        </Section>
      )}

      {/* STEP 5 — Article outline */}
      {outline && (
        <Section
          id="outline"
          step={5}
          title="Article outline"
          isDone={!!outline}
          isActive={stepStates[4] === "active"}
        >
          <div>
            <h3 className="text-xl font-bold leading-snug text-ink">
              {safeText(outline.h1, "Untitled outline")}
            </h3>

            {(() => {
              const sections = toOutlineSections(outline.sections);
              if (sections.length === 0) {
                return <p className="mt-3 text-sm leading-6 text-ink-muted">No sections saved yet.</p>;
              }
              return (
                <ol className="mt-5 space-y-3">
                  {sections.map((s, i) => (
                    <li key={i} className="rounded-card border border-line bg-surface p-4">
                      <p className="flex items-baseline gap-2.5 font-semibold leading-7 text-ink">
                        <span className="shrink-0 text-xs font-bold text-ink-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {safeText(s.heading)}
                      </p>
                      {s.points.length > 0 && (
                        <ul className="mt-2.5 space-y-1.5 pl-6">
                          {s.points.map((p, j) => (
                            <li key={j} className="flex items-start gap-2 text-[14px] leading-6 text-ink-secondary">
                              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />
                              {safeText(p)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              );
            })()}
          </div>

          <div className="mt-8 space-y-3">
            <a
              href={`/dashboard/projects/${id}/outline.pdf`}
              className="flex w-full items-center justify-center gap-2 rounded-card bg-brand px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Download PDF
            </a>
            <a
              href={`/dashboard/projects/${id}/editor`}
              className="flex w-full items-center justify-center rounded-card border border-brand px-5 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
            >
              Open in Editor
            </a>
            <p className="text-center text-xs text-ink-muted">PDF includes the full outline.</p>
          </div>
        </Section>
      )}
    </div>
  );
}
