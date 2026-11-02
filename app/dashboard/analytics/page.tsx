import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ExternalLink, Globe, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decryptToken, listSearchConsoleSites } from "@/lib/google";

export const metadata: Metadata = { title: "Analytics" };

const STATUS_MESSAGE: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Google connected — Search Console sites are listed below." },
  denied: {
    ok: false,
    text: "Google blocked the connection (Error 403: access_denied). Add your email under Google Cloud Console → OAuth consent screen → Test users, then reconnect.",
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
    { label: "Projects", value: projectsRes.count ?? 0 },
    { label: "Analyses run", value: analysesRes.count ?? 0 },
    { label: "Opportunities", value: opportunitiesRes.count ?? 0 },
    { label: "Drafts", value: draftsRes.count ?? 0 },
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

  const isConnected = Boolean(connection?.refresh_token_enc);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Analytics"
        description="Your workspace activity and connected data sources."
      />

      {status ? (
        <p
          className={`mt-5 rounded-card px-4 py-3 text-sm font-medium ${
            status.ok
              ? "border border-success/20 bg-success-soft text-success"
              : "border border-error/20 bg-error-soft text-error"
          }`}
        >
          {status.text}
        </p>
      ) : null}

      {/* Workspace stats */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Workspace activity
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-line bg-surface px-5 py-5"
            >
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                {stat.label}
              </dt>
              <dd className="mt-2 font-sans text-3xl font-semibold tracking-tight text-ink">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Google Search Console */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Connected sources
        </p>

        <div className="mt-3 rounded-card border border-line bg-surface">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-control ${
                isConnected ? "bg-success-soft" : "bg-surface-subtle"
              }`}>
                <BarChart3 size={18} className={isConnected ? "text-success" : "text-ink-muted"} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">Google Search Console</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isConnected
                      ? "bg-success-soft text-success"
                      : "bg-surface-subtle text-ink-muted"
                  }`}>
                    {isConnected ? (
                      <><Wifi size={9} /> Connected</>
                    ) : (
                      <><WifiOff size={9} /> Not connected</>
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {isConnected
                    ? `Signed in as ${connection?.google_email ?? "your Google account"} · read-only`
                    : "Connect to see which pages get clicks and impressions from Google."}
                </p>
              </div>
            </div>
            <Link
              href="/api/auth/google/start"
              className="inline-flex h-9 items-center gap-2 rounded-field border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-subtle"
            >
              <RefreshCw size={14} />
              {isConnected ? "Reconnect" : "Connect Google"}
            </Link>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {sitesError ? (
              <p className="rounded-control bg-error-soft px-4 py-2.5 text-sm text-error">
                {sitesError}
              </p>
            ) : isConnected ? (
              sites.length > 0 ? (
                <div>
                  <p className="mb-3 text-xs font-medium text-ink-muted">
                    {sites.length} {sites.length === 1 ? "property" : "properties"} found
                  </p>
                  <ul className="divide-y divide-line rounded-card border border-line">
                    {sites.map((site) => (
                      <li
                        key={site.siteUrl}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Globe size={14} className="shrink-0 text-ink-muted" />
                          <span className="min-w-0 truncate text-sm font-medium text-ink">
                            {site.siteUrl}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-xs text-ink-muted">{site.permissionLevel}</span>
                          <a
                            href={`https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(site.siteUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand transition-colors hover:text-brand-hover"
                            aria-label="Open in Search Console"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">
                  No Search Console properties found for this account.
                </p>
              )
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                {[
                  "See which pages get traffic from Google",
                  "Track clicks and impressions over time",
                  "Spot which keywords bring visitors",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-ink-secondary">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
