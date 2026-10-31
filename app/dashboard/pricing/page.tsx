import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { GetCredits } from "@/components/dashboard/get-credits";
import { PricingPlans } from "@/components/pricing-plans";
import { getPlanStatus } from "@/lib/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Upgrade",
  robots: { index: false, follow: false },
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string; cycle?: string; new?: string }>;
}) {
  const { plan, cycle, new: isNew } = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = userData.user
    ? await supabase
        .from("profiles")
        .select("subscription_status, ai_credits_balance, card_bonus_claimed")
        .eq("id", userData.user.id)
        .maybeSingle()
    : { data: null };

  const profileRow = profile as {
    subscription_status?: string | null;
    ai_credits_balance?: number | null;
    card_bonus_claimed?: boolean | null;
  } | null;
  const isPro = getPlanStatus(userData.user, 0, profileRow?.subscription_status).isPro;
  const highlightPlan = plan === "starter" || plan === "pro" || plan === "scale" ? plan : undefined;
  const initialCycle = cycle === "yearly" ? ("yearly" as const) : ("monthly" as const);
  const credits = profileRow?.ai_credits_balance ?? 50;

  // Current workspace usage, shown so upgrading feels informed rather than pushy.
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const [projectsRes, analysesRes, draftsRes, spendRes, recentRes] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("website_analyses").select("id", { count: "exact", head: true }),
    supabase.from("article_drafts").select("id", { count: "exact", head: true }),
    // Missing ledger table (migration not applied) returns an error — data
    // falls back to [] so the page never breaks.
    supabase.from("credit_ledger").select("delta").gte("created_at", weekAgo).lt("delta", 0),
    supabase
      .from("credit_ledger")
      .select("delta, reason, step, model, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const usage = [
    { label: "Projects", value: projectsRes.count ?? 0 },
    { label: "Analyses", value: analysesRes.count ?? 0 },
    { label: "Drafts", value: draftsRes.count ?? 0 },
  ];
  type LedgerRow = { delta: number; reason: string; step: string | null; model: string | null; created_at: string };
  const spendRows = ((spendRes.data ?? []) as { delta: number }[]).filter(
    (r) => typeof r.delta === "number",
  );
  const spentWeek = spendRows.reduce((n, r) => n - Math.min(0, r.delta), 0);
  const recent = ((recentRes.data ?? []) as LedgerRow[]).filter((r) => typeof r.delta === "number");

  return (
    <div className="min-w-0">
      <PageHeader
        title="Upgrade to Pro"
        description="Simple, transparent pricing for serious content teams. Cancel anytime."
      />
      {highlightPlan ? (
        <p className="mt-4 rounded-control bg-brand-soft/40 px-4 py-2.5 text-sm font-medium text-brand">
          Continuing with {highlightPlan === "pro" ? "Pro" : highlightPlan === "scale" ? "Scale" : "Starter"} — pick
          monthly or yearly below to check out.
        </p>
      ) : isNew ? (
        <p className="mt-4 rounded-control bg-brand-soft/40 px-4 py-2.5 text-sm font-medium text-brand">
          Welcome — pick a plan to start your 7-day free trial, or explore free first. No card required.
        </p>
      ) : null}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Your credits
          </h2>
          <GetCredits credits={credits} cardClaimed={profileRow?.card_bonus_claimed ?? false} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-px rounded-card border border-line bg-line">
          <div className="bg-surface px-5 py-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Balance</dt>
            <dd className="mt-1 font-sans text-2xl tracking-tight text-ink">{credits}</dd>
          </div>
          <div className="bg-surface px-5 py-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Used · last 7 days</dt>
            <dd className="mt-1 font-sans text-2xl tracking-tight text-ink">{spentWeek}</dd>
          </div>
        </dl>
        {recent.length > 0 ? (
          <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
            {recent.map((r, i) => (
              <li key={`${r.created_at}-${i}`} className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm">
                <span className="min-w-0 truncate text-ink-secondary">
                  {r.reason === "step"
                    ? `AI ${r.step ?? "step"}`
                    : r.reason === "refund"
                      ? `Refunded ${r.step ?? "step"}`
                      : r.reason === "claim"
                        ? "Card bonus claimed"
                        : r.reason}
                  {r.model ? <span className="text-ink-muted"> · {r.model}</span> : null}
                </span>
                <span className={r.delta < 0 ? "font-medium text-ink" : "font-medium text-success"}>
                  {r.delta < 0 ? r.delta : `+${r.delta}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-ink-muted">
            No credit activity yet — each AI step costs 1 credit, failed runs are refunded.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">Your usage</h2>
        <dl className="mt-4 grid grid-cols-3 gap-px rounded-card border border-line bg-line">
          {usage.map((u) => (
            <div key={u.label} className="bg-surface px-5 py-4">
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">{u.label}</dt>
              <dd className="mt-1 font-sans text-2xl tracking-tight text-ink">{u.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-10">
        <PricingPlans
          isPro={isPro}
          email={userData.user?.email ?? undefined}
          userId={userData.user?.id ?? undefined}
          highlightPlan={highlightPlan}
          hideFree={!isNew}
          initialCycle={initialCycle}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs text-ink-muted">
        <p>Secure payments powered by Dodo Payments. Cancel anytime.</p>
        <Link
          href="/dashboard"
          className="font-medium text-ink-secondary transition-colors hover:text-ink"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        By subscribing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
          Terms of Service
        </Link>
        ,{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/refund-policy" className="underline underline-offset-4 hover:text-ink">
          Refund Policy
        </Link>
        .
      </p>
    </div>
  );
}
