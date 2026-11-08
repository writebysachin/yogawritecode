import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CommandPaletteMount } from "@/components/dashboard/command-palette-mount";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import type { ProjectNavItem } from "@/components/dashboard/sidebar-nav";
import { getUserDisplayName } from "@/lib/auth/user";
import { getSubscription } from "@/lib/billing/subscription";
import { getPlanStatus } from "@/lib/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, subscription_status")
    .eq("id", data.user.id)
    .maybeSingle();
  const name = getUserDisplayName(data.user, profile?.full_name);
  const email = data.user.email ?? undefined;
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select("id, name")
    .order("updated_at", { ascending: false });

  if (projectsError) {
    console.error("[dashboard layout] projects query failed", projectsError);
  }

  const projects = (projectsData ?? []) as ProjectNavItem[];
  const profileRow = profile as { subscription_status?: string | null } | null;
  const planStatus = getPlanStatus(data.user, projects.length, profileRow?.subscription_status);

  // Billing state for the sidebar badge and the credit balance (TRD FR-6.8).
  const subscription = await getSubscription();

  return (
    <div className="min-h-screen">
      <CommandPaletteMount />
      <Sidebar
        name={name}
        email={email}
        projects={projects}
        isPro={planStatus.isPro}
        credits={subscription.ai_credits}
      />
      <MobileHeader
        name={name}
        email={email}
        projects={projects}
        isPro={planStatus.isPro}
        credits={subscription.ai_credits}
      />
      <main className="lg:pl-60">
        <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-14">
          {children}
        </div>
      </main>
    </div>
  );
}
