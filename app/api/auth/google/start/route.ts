import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthUrl,
  newOAuthState,
} from "@/lib/google";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.redirect(new URL("/login?next=/api/auth/google/start", request.url));
  }

  const state = newOAuthState();
  const response = NextResponse.redirect(
    buildGoogleAuthUrl(state, new URL(request.url).origin),
  );
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 600,
  });
  return response;
}
