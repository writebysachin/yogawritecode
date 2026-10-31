import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BillingCycle } from "@/lib/dodo";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string; cycle?: string; error?: string }>;
}) {
  const { plan, cycle, error } = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const params = new URLSearchParams();
    if (plan) params.set("plan", plan);
    if (cycle) params.set("cycle", cycle);
    const next = params.size ? `/onboarding?${params.toString()}` : "/onboarding";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  // Existing accounts that already finished onboarding skip the survey.
  if (data.user.user_metadata?.onboarding_completed_at) {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  const fullName = (profile as { full_name?: string | null } | null)?.full_name?.trim();
  const name = fullName || data.user.email?.split("@")[0] || "there";
  const initialCycle: BillingCycle = cycle === "yearly" ? "yearly" : "monthly";

  return (
    <main className="min-h-screen bg-canvas px-5 py-14 font-sans sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          Welcome to YogaWriteCode
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
          Hi {name} — let&apos;s set up your workspace
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary">
          Two quick steps: tell us what you are building, then choose a plan. Start free or try a
          paid plan for 7 days — no card required.
        </p>

        <OnboardingWizard
          initialPlan={plan}
          initialCycle={initialCycle}
          email={data.user.email ?? ""}
          error={error}
        />
      </div>
    </main>
  );
}
