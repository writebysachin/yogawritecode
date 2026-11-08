import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getUserDisplayName } from "@/lib/auth/user";
import { getPlanStatus } from "@/lib/plan";
import { getSubscription } from "@/lib/billing/subscription";
import { PLAN_NAMES } from "@/lib/dodo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const { data: profile } = data.user
    ? await supabase
        .from("profiles")
        .select("full_name, subscription_status")
        .eq("id", data.user.id)
        .maybeSingle()
    : { data: null };
  const name = data.user
    ? getUserDisplayName(data.user, profile?.full_name)
    : "Your account";
  const email = data.user?.email ?? "";

  const subscription = await getSubscription();
  const profileRow = profile as { subscription_status?: string | null } | null;
  const planStatus = getPlanStatus(data.user, 0, profileRow?.subscription_status);
  const isPro = planStatus.isPro;

  // Resolve the display name for the current plan
  const currentPlan = subscription.current_plan; // "pro" | "scale" | null
  const planLabel = planStatus.isTrialActive
    ? `Pro Trial (${planStatus.daysLeftInTrial} days left)`
    : isPro
      ? currentPlan === "scale"
        ? PLAN_NAMES.scale
        : currentPlan === "pro"
          ? PLAN_NAMES.pro
          : "Pro"
      : "Starter (Free)";

  // Only show upgrade if not already on the top plan
  const isOnScale = isPro && currentPlan === "scale";
  const upgradeLabel = isOnScale
    ? null
    : isPro && currentPlan === "pro"
      ? "Upgrade to Scale"
      : "Upgrade to Pro";
  const upgradeHref = isOnScale
    ? null
    : isPro && currentPlan === "pro"
      ? "/dashboard/upgrade?plan=scale"
      : "/dashboard/upgrade";

  return (
    <>
      <PageHeader title="Account" description="Manage your account and preferences." />

      <div className="mt-8 space-y-6">
        <section className="rounded-card border border-line bg-surface p-6">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">Account</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Name</p>
              <p className="mt-1 text-sm text-ink">{name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Email</p>
              <p className="mt-1 text-sm text-ink">{email}</p>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-line bg-surface p-6">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">Billing</h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Plan</p>
              <p className="mt-1 text-sm text-ink">{planLabel}</p>
            </div>
            {isOnScale ? (
              <Link
                href="/dashboard/pricing"
                className="text-sm font-medium text-brand underline underline-offset-4"
              >
                Manage plan
              </Link>
            ) : upgradeLabel && upgradeHref ? (
              <Link
                href={upgradeHref}
                className="inline-flex h-10 items-center justify-center rounded-field bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                {upgradeLabel}
              </Link>
            ) : null}
          </div>
          <p className="mt-4 border-t border-line pt-4 text-xs text-ink-muted">
            Payments are processed by Dodo Payments. Read our{" "}
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
        </section>

        <section className="rounded-card border border-line bg-surface p-6">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">AI Features</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Yoga Write Code uses AI to analyze websites and generate content plans. All AI features
            are enabled by default and work automatically.
          </p>
        </section>

        <section className="rounded-card border border-line bg-surface p-6">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">Support</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Questions or feedback? Email us at support@yogawritecode.com.
          </p>
        </section>
      </div>
    </>
  );
}