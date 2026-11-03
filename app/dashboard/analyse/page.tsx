import type { Metadata } from "next";
import Link from "next/link";
import { Globe } from "lucide-react";
import { GenerateButton } from "@/components/dashboard/generate-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { analyzeWebsite } from "@/app/dashboard/projects/[id]/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Analyse Website" };

export default async function AnalysePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const { error } = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name, website_url, website_analyses ( id )")
    .order("updated_at", { ascending: false });

  const projects = (projectsData ?? []) as {
    id: string;
    name: string;
    website_url: string;
    website_analyses: { id: string }[];
  }[];

  const unanalysed = projects.filter((p) => (p.website_analyses ?? []).length === 0);
  const analysed = projects.filter((p) => (p.website_analyses ?? []).length > 0);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Analyse Website"
        description="Run a website analysis for any project to generate content opportunities."
      />

      {error ? (
        <div className="mt-4 rounded-lg border border-error bg-error-soft px-4 py-3 text-sm text-error">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      {projects.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center">
          <Globe size={32} className="mx-auto text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No projects yet</p>
          <p className="mt-1 text-sm text-ink-muted">Create a project first, then analyse its website.</p>
          <Link
            href="/dashboard/projects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-field bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            New project
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {unanalysed.length > 0 && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Not yet analysed — {unanalysed.length} project{unanalysed.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-3">
                {unanalysed.map((project) => (
                  <li
                    key={project.id}
                    className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">{project.website_url}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone="neutral">New</Badge>
                      <GenerateButton
                        action={analyzeWebsite}
                        label="Analyse"
                        pendingLabel="Analysing…"
                        hiddenFields={{ projectId: project.id, returnTo: "/dashboard/analyse" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analysed.length > 0 && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Already analysed — {analysed.length} project{analysed.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-3">
                {analysed.map((project) => (
                  <li
                    key={project.id}
                    className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">{project.website_url}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone="success">Analysed</Badge>
                      <Link
                        href={`/dashboard/projects/${project.id}#analysis`}
                        className="text-sm font-medium text-brand underline underline-offset-4"
                      >
                        View
                      </Link>
                      <GenerateButton
                        action={analyzeWebsite}
                        label="Re-analyse"
                        pendingLabel="Analysing…"
                        hiddenFields={{ projectId: project.id, returnTo: "/dashboard/analyse" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
