import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AnalysePage() {
  const supabase = await createSupabaseServerClient();

  // Find the user's most recently updated project and redirect to it,
  // landing on the #analysis section. If they have no projects yet,
  // send them to create one.
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1);

  const projectId = projects?.[0]?.id;
  if (projectId) {
    redirect(`/dashboard/projects/${projectId}#analysis`);
  }
  redirect("/dashboard/projects/new");
}
