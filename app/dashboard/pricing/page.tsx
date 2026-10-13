import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PricingPlans } from "@/components/pricing-plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Upgrade",
  robots: { index: false, follow: false },
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string; cycle?: string }>;
}) {
  const { plan } = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = userData.user
    ? await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", userData.user.id)
        .maybeSingle()
    : { data: null };

  const profileRow = profile as { subscription_status?: string | null } | null;
  const isPro = profileRow?.subscription_status === "active" || profileRow?.subscription_status === "trialing";
  const highlightPlan = plan === "starter" || plan === "pro" || plan === "scale" ? plan : undefined;

  // Current workspace usage, shown so upgrading feels informed rather than pushy.
  const [projectsRes, analysesRes, draftsRes] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("website_analyses").select("id", { count: "exact", head: true }),
    supabase.from("article_drafts").select("id", { count: "exact", head: true }),
  ]);
  const usage = [
    { label: "Projects", value: projectsRes.count ?? 0 },
    { label: "Analyses", value: analysesRes.count ?? 0 },
    { label: "Drafts", value: draftsRes.count ?? 0 },
  ];

  // Price IDs are server-only values passed to the client toggle as props.
  const monthlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_MONTHLY ?? "";
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_YEARLY ?? "";

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
      ) : null}

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
          monthlyPriceId={monthlyPriceId}
          yearlyPriceId={yearlyPriceId}
          isPro={isPro}
          email={userData.user?.email ?? undefined}
          userId={userData.user?.id ?? undefined}
          highlightPlan={highlightPlan}
          hideFree
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
