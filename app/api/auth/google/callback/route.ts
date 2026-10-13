import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_SCOPES,
  encryptToken,
  exchangeGoogleCode,
  googleAccountEmail,
} from "@/lib/google";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const done = (status: string) => {
    const response = NextResponse.redirect(
      new URL(`/dashboard/analytics?google=${status}`, origin),
    );
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  };

  if (url.searchParams.get("error")) return done("denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === GOOGLE_OAUTH_STATE_COOKIE)?.[1];

  if (!code || !state || !cookieState || state !== decodeURIComponent(cookieState)) {
    return done("invalid_state");
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return done("login_required");

  let tokens: { access_token: string; refresh_token?: string };
  try {
    tokens = await exchangeGoogleCode(code, origin);
  } catch {
    return done("exchange_failed");
  }

  // Google only returns a refresh_token with access_type=offline + consent.
  // Without it there is nothing durable to store.
  if (!tokens.refresh_token) return done("no_refresh_token");

  let encrypted: string;
  try {
    encrypted = encryptToken(tokens.refresh_token);
  } catch {
    return done("not_configured");
  }

  const email = await googleAccountEmail(tokens.access_token);

  const { error } = await supabase.from("google_connections").upsert(
    {
      user_id: data.user.id,
      google_email: email,
      refresh_token_enc: encrypted,
      scopes: GOOGLE_SCOPES.join(" "),
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return done("save_failed");

  return done("connected");
}
