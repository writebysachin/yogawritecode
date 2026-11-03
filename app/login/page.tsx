import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Field, FormError, OrDivider, PrimaryButton, inputClass } from "@/components/form";
import { login } from "@/lib/auth/actions";
import { friendlyAuthError } from "@/lib/auth/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Log in" };

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter ($9/mo)",
  pro: "Pro ($19/mo)",
  scale: "Scale ($40/mo)",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string; cycle?: string; next?: string }>;
}) {
  const { error, plan, cycle, next } = await searchParams;
  const planLabel = plan ? (PLAN_LABEL[plan] ?? plan) : null;
  const nextParam =
    next ?? (plan ? `/onboarding?plan=${plan}&cycle=${cycle ?? "monthly"}` : undefined);

  // Already signed in? Skip the form. This also keeps pricing CTAs working
  // for existing customers (they land on onboarding, which forwards them to
  // the dashboard when the survey is already complete).
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const safeNext =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : "/dashboard";

    // On mobile, don't auto-redirect — show a button instead so the user
    // can tap through deliberately rather than being bounced away.
    const headersList = await headers();
    const ua = headersList.get("user-agent") ?? "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    if (!isMobile) redirect(safeNext);

    return (
      <AuthShell>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">
          You&apos;re signed in
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Tap below to open your dashboard.
        </p>
        <div className="mt-6">
          <Link
            href={safeNext}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand px-5 py-3 text-sm font-semibold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            Go to Dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
      </AuthShell>
    );
  }

  const signupParams = new URLSearchParams();
  if (plan) {
    signupParams.set("plan", plan);
    signupParams.set("cycle", cycle ?? "monthly");
  }
  if (nextParam) signupParams.set("next", nextParam);
  const signupHref = signupParams.size ? `/signup?${signupParams.toString()}` : "/signup";

  return (
    <AuthShell>
      <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">Log in</h1>
      <p className="mt-2 text-sm text-ink-secondary">
        New here?{" "}
        <Link
          href={signupHref}
          className="font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Create an account
        </Link>
      </p>
      {planLabel ? (
        <p className="mt-3 rounded-control bg-brand-soft/40 px-3 py-2 text-sm font-medium text-brand">
          Welcome back — log in to continue to {planLabel}.
        </p>
      ) : null}

      <div className="mt-5">
        <FormError message={friendlyAuthError(error)} />
      </div>

      <form action={login} className="mt-5 space-y-4">
        {nextParam ? <input type="hidden" name="next" value={nextParam} /> : null}
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" required className={inputClass} />
        </Field>

        <Field label="Password" htmlFor="password">
          <input id="password" name="password" type="password" required className={inputClass} />
        </Field>

        <PrimaryButton fullWidth>Log in</PrimaryButton>
      </form>

      <OrDivider />

      <GoogleAuthButton label="Continue with Google" next={nextParam} />

      <p className="mt-5 text-xs text-ink-muted">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}
