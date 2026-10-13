import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  return handleAuthCallback(request);
}

async function handleAuthCallback(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    // New Google users choose a plan first: buying is step one of onboarding.
    // A plan-specific `next` (e.g. /dashboard/pricing?plan=pro) is always respected.
    if (next === "/onboarding") {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", data.user.id)
          .maybeSingle();
        const createdAt = (profile as { created_at?: string } | null)?.created_at;
        const isNew =
          !createdAt || Date.now() - new Date(createdAt).getTime() < 5 * 60 * 1000;
        if (isNew) {
          return NextResponse.redirect(new URL("/dashboard/pricing?new=1", requestUrl.origin));
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
