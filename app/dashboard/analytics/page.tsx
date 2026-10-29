import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decryptToken, listSearchConsoleSites } from "@/lib/google";

export const metadata: Metadata = { title: "Analytics" };

const STATUS_MESSAGE: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Google connected — Search Console sites are listed below." },
  denied: {
    ok: false,
    text: "Google blocked the connection (Error 403: access_denied). The OAuth consent screen is still in Testing mode — add your email under Google Cloud Console → APIs & Services → OAuth consent screen → Audience → Test users, then reconnect.",
  },
  invalid_state: { ok: false, text: "That login attempt expired. Start the connection again." },
  login_required: { ok: false, text: "Log in first, then reconnect Google." },
  exchange_failed: { ok: false, text: "Google did not accept the connection. Try again." },
  no_refresh_token: {
    ok: false,
    text: "Google did not return a refresh token. Disconnect the app at myaccount.google.com/permissions and reconnect.",
  },
  not_configured: {
    ok: false,
    text: "Google OAuth is not configured on this environment yet (missing encryption key).",
  },
  save_failed: { ok: false, text: "Connected to Google but could not save it. Try again." },
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ google?: string }>;
}) {
  const { google: googleStatus } = (await searchParams) ?? {};
  const status = googleStatus ? STATUS_MESSAGE[googleStatus] : null;

  const supabase = await createSupabaseServerClient();

  const [projectsRes, analysesRes, opportunitiesRes, draftsRes, connectionRes] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("website_analyses").select("id", { count: "exact", head: true }),
    supabase.from("content_opportunities").select("id", { count: "exact", head: true }),
    supabase.from("article_drafts").select("id", { count: "exact", head: true }),
    supabase.from("google_connections").select("google_email, refresh_token_enc").maybeSingle(),
  ]);

  const stats = [
    { label: "Projects", value: String(projectsRes.count ?? 0) },
    { label: "Analyses", value: String(analysesRes.count ?? 0) },
    { label: "Opportunities", value: String(opportunitiesRes.count ?? 0) },
    { label: "Drafts", value: String(draftsRes.count ?? 0) },
  ];

  const connection = connectionRes.data as {
    google_email?: string | null;
    refresh_token_enc?: string | null;
  } | null;

  let sites: { siteUrl: string; permissionLevel: string }[] = [];
  let sitesError: string | null = null;
  if (connection?.refresh_token_enc) {
    try {
      sites = await listSearchConsoleSites(decryptToken(connection.refresh_token_enc));
    } catch {
      sitesError = "Could not load Search Console sites. Reconnect Google below.";
    }
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Real activity in your workspace — nothing simulated."
      />

      {status ? (
        <p
          className={`mt-6 rounded-control px-4 py-2.5 text-sm font-medium ${
            status.ok ? "bg-brand-soft/40 text-brand" : "bg-error-bg text-error"
          }`}
        >
          {status.text}
        </p>
      ) : null}

      <dl className="mt-8 grid grid-cols-2 gap-px border border-stone-200 bg-stone-200 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white px-5 py-6">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-stone-400">
              {stat.label}
            </dt>
            <dd className="font-sans mt-2 text-3xl tracking-tight text-stone-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-card border border-line bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
              Google Search Console
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {connection
                ? `Connected as ${connection.google_email ?? "your Google account"} (read-only).`
                : "Connect once — real click and impression data flows into your content planning."}
            </p>
          </div>
          <Link
            href="/api/auth/google/start"
            className="inline-flex h-10 items-center justify-center rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            {connection ? "Reconnect Google" : "Connect Google"}
          </Link>
        </div>

        {sitesError ? (
          <p className="mt-4 rounded-control bg-error-bg px-4 py-2.5 text-sm font-medium text-error">
            {sitesError}
          </p>
        ) : null}

        {connection ? (
          sites.length > 0 ? (
            <ul className="mt-4 divide-y divide-line rounded-card border border-line">
              {sites.map((site) => (
                <li
                  key={site.siteUrl}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <span className="min-w-0 truncate font-medium text-ink">{site.siteUrl}</span>
                  <span className="shrink-0 text-xs text-ink-muted">{site.permissionLevel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">
              No Search Console properties found for this account yet.
            </p>
          )
        ) : (
          <p className="mt-4 text-sm text-stone-500">
            External traffic metrics arrive when you connect a real analytics source.
          </p>
        )}
      </section>
    </>
  );
}
