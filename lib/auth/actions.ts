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
  // An explicit `next` always wins (checkout, a shared link, etc.).
  if (next) redirect(next);

  // Everyone else finishes the one-time survey unless they already have.
  // This covers both brand-new accounts and older accounts that signed up
  // before onboarding existed.
  const { data } = await supabase.auth.getUser();
  if (data.user && !data.user.user_metadata?.onboarding_completed_at) {
    redirect("/onboarding");
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
  // Every new account goes through the quick survey + plan choice. The
  // selected plan is carried along so the plan step starts pre-selected.
  // An explicit `next` (e.g. returning to checkout) still wins.
  const afterAuth =
    next ||
    (plan ? `/onboarding?plan=${plan}&cycle=${cycle}` : "/onboarding");
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

  const requestedNext = formData ? String(formData.get("next") ?? "") : "";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/onboarding";

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