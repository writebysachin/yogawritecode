"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TRIAL_DAYS } from "@/lib/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const GOALS = new Set([
  "personal-blog",
  "saas-content",
  "agency-client",
  "something-else",
]);

const PLANS = new Set(["free", "starter", "pro", "scale"]);

/**
 * Saves the onboarding survey answer and starts the chosen plan.
 *
 * Free plan: nothing else to do — new accounts already have the free tier.
 * Paid plan: the 7-day trial starts immediately with no card. The trial end is
 * stored in auth metadata and read by getPlanStatus(); when it lapses the
 * account naturally falls back to the free limits.
 */
export async function completeOnboarding(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?next=%2Fonboarding");
  }

  const goal = String(formData.get("goal") ?? "");
  const plan = String(formData.get("plan") ?? "free");
  const cycle = String(formData.get("cycle") ?? "monthly") === "yearly" ? "yearly" : "monthly";

  if (!GOALS.has(goal) || !PLANS.has(plan)) {
    redirect(`/onboarding?error=${encodeURIComponent("Pick an option to continue.")}`);
  }

  const now = new Date();
  const metadata: Record<string, string> = {
    onboarding_goal: goal,
    onboarding_completed_at: now.toISOString(),
  };

  if (plan !== "free") {
    metadata.trial_plan = plan;
    metadata.trial_cycle = cycle;
    metadata.trial_end = new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString();
  }

  const { error } = await supabase.auth.updateUser({ data: metadata });

  if (error) {
    console.error("[onboarding]", error.message);
    redirect(
      `/onboarding?error=${encodeURIComponent("Could not save your plan. Please try again.")}`,
    );
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}
