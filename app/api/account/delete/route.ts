import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  try {
    // Delete user data from all tables in dependency order
    const tables = [
      "projects",
      "website_analyses",
      "content_opportunities",
      "topic_clusters",
      "seo_briefs",
      "article_outlines",
      "article_drafts",
      "credit_ledger",
      "google_connections",
      "webhook_events",
      "profiles",
    ];

    for (const table of tables) {
      const { error } = await adminClient.from(table).delete().eq("user_id", userId);
      // Ignore errors for tables that use a different column name or don't exist;
      // the auth user deletion below is the authoritative cleanup step.
      if (error) {
        console.warn(`[DeleteAccount] could not delete from ${table}:`, error.message);
      }
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("[DeleteAccount] auth.admin.deleteUser failed:", deleteAuthError.message);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DeleteAccount] unexpected error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
