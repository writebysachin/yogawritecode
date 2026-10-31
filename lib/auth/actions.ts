"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "");
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "";
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("[login]", error.message);
    const params = new URLSearchParams({ error: error.message });
    if (next) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }
  revalidatePath("/dashboard", "layout");
  if (next) redirect(next);

  // Returning users go straight to the dashboard. Brand-new accounts
  // (created in the last 5 minutes) see pricing first, then checkout,
  // then the onboarding welcome — mirroring the Google OAuth flow.
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
    if (isNew) redirect("/dashboard/pricing?new=1");
  }
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const plan = String(formData.get("plan") ?? "");
  const cycle = String(formData.get("cycle") ?? "monthly");
  const requestedNext = String(formData.get("next") ?? "");
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "";
  // Plan flow: pricing first (with welcome banner), pricing links to
  // checkout, checkout routes to Dodo or back here. Free flow: onboarding
  // welcome instead of a bare dashboard.
  const afterAuth =
    next ||
    (plan
      ? `/dashboard/pricing?plan=${plan}&cycle=${cycle}&new=1`
      : "/onboarding?welcome=1");
  const errorHref = (message: string) => {
    const params = new URLSearchParams({ error: message });
    if (plan) params.set("plan", plan);
    if (cycle) params.set("cycle", cycle);
    if (next) params.set("next", next);
    return `/signup?${params.toString()}`;
  };

  if (password.length < 6) {
    redirect(errorHref("Password must be at least 6 characters."));
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Where Supabase sends the confirmation link. /auth/confirm exchanges the
      // PKCE code for a session and sends the welcome email. This URL must also
      // be allowlisted under Supabase -> Authentication -> URL Configuration.
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(afterAuth)}`,
    },
  });

  if (error) {
    console.error("[signup]", error.message);
    redirect(errorHref(error.message));
  }

  // No session means the project requires email confirmation, so the account
  // cannot be used until the link is opened. Redirecting to /dashboard here
  // would bounce straight back to /login with no explanation.
  if (!data.session) {
    const params = new URLSearchParams();
    if (plan) params.set("plan", plan);
    if (cycle) params.set("cycle", cycle);
    if (next) params.set("next", next);
    const query = params.toString();
    redirect(query ? `/check-email?${query}` : "/check-email");
  }

  // Confirmation is disabled in Supabase, so the account is usable already.
  // Best-effort: a failed welcome email must not block a working signup.
  if (data.user?.email) {
    await sendWelcomeEmail(data.user.email);
  }

  revalidatePath("/dashboard", "layout");
  redirect(afterAuth);
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const next =
    (formData ? String(formData.get("next") ?? "") : "") || "/onboarding";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=" + encodeURIComponent("Could not start Google sign in."));
  }

  redirect(data.url);
}