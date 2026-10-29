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
    // Older rows sometimes store a single string or JSON-encoded array.
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

function Section({ id, step, title, children }: { id: string; step: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24 rounded-card border border-line bg-surface p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">Step {step} of 5</p>
      <h2 className="font-sans mt-1 text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4 max-w-2xl">{children}</div>
    </section>
  );
}

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

  // Fetch all data
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

      {/* Progress Steps */}
      <div className="mt-6 flex flex-wrap gap-2">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${analysis ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {analysis ? "✓" : "○"} 01 Analyze
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${opportunities.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {opportunities.length > 0 ? "✓" : "○"} 02 Opportunities
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${cluster ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {cluster ? "✓" : "○"} 03 Cluster
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${brief ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {brief ? "✓" : "○"} 04 Brief
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${outline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {outline ? "✓" : "○"} 05 Outline
        </span>
      </div>

      {/* STEP 1: Analysis */}
      <Section id="analysis" step={1} title="Website analysis">
        {analysis ? (
          <div className="max-w-2xl">
            <FactRow label="Company summary" value={analysis.company_summary} />
            <FactRow label="Product category" value={analysis.product_category} />
            <FactRow label="Target audience" value={analysis.target_audience} />
            <FactRow label="Positioning" value={analysis.positioning} />
          </div>
        ) : (
          <GenerateButton
            action={analyzeWebsite}
            label="Analyze Website"
            pendingLabel="Analyzing…"
            hiddenFields={{ projectId: id }}
          />
        )}
      </Section>

      {/* STEP 2: Opportunities */}
      {analysis && (
        <Section id="opportunities" step={2} title="Content opportunities">
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

      {/* STEP 3: Topic Cluster */}
      {cluster && (
        <Section id="cluster" step={3} title="Topic cluster">
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

      {/* STEP 4: SEO Brief */}
      {brief && (
        <Section id="brief" step={4} title="SEO brief">
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

      {/* STEP 5: Outline */}
      {outline && (
        <Section id="outline" step={5} title="Article outline">
          <div>
            <h3 className="text-lg font-semibold leading-8 text-ink">{safeText(outline.h1, "Untitled outline")}</h3>
            {(() => {
              const sections = toOutlineSections(outline.sections);
              if (sections.length === 0) {
                return <p className="mt-3 text-sm leading-6 text-ink-muted">No sections saved yet.</p>;
              }
              return (
                <ol className="mt-4 space-y-4">
                  {sections.map((s, i) => (
                    <li key={i} className="rounded-lg border border-line bg-surface-subtle p-4">
                      <p className="font-medium leading-7 text-ink">
                        <span className="mr-2 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                        {safeText(s.heading)}
                      </p>
                      {s.points.length > 0 && (
                        <ul className="mt-2 space-y-1.5 pl-6 list-disc text-sm leading-6 text-ink-secondary">
                          {s.points.map((p, j) => <li key={j}>{safeText(p)}</li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              );
            })()}
          </div>
        </Section>
      )}
    </div>
  );
}