import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  return handleAuthCallback(request);
}

async function handleAuthCallback(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  // Google / Supabase redirects back here with ?error=access_denied when the
  // OAuth consent screen blocks the account (e.g. app still in "Testing" mode
  // and the email is not listed under Audience → Test users). Surfacing it
  // here stops a silent bounce to /dashboard → /login with no explanation.
  const oauthError =
    requestUrl.searchParams.get("error") ?? requestUrl.searchParams.get("error_code");
  if (oauthError) {
    const rawDescription = requestUrl.searchParams.get("error_description") ?? "";
    const friendly =
      /access_denied/i.test(oauthError) || /access_denied/i.test(rawDescription)
        ? "Google blocked this sign-in (Error 403: access_denied). The OAuth consent screen is still in Testing mode — add this email under Google Cloud Console → APIs & Services → OAuth consent screen → Audience → Test users, or complete verification to publish the app."
        : `Google sign-in failed (${oauthError}). Please try again.`;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(friendly)}`, requestUrl.origin),
    );
  }

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
