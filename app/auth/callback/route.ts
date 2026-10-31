import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  return handleAuthCallback(request);
}

async function handleAuthCallback(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/dashboard";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";

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
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
