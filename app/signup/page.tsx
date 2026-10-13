import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Field, FormError, OrDivider, PrimaryButton, inputClass } from "@/components/form";
import { signup } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Sign up" };

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter ($9/mo)",
  pro: "Pro ($19/mo)",
  scale: "Scale ($40/mo)",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string; cycle?: string; next?: string }>;
}) {
  const { error, plan, cycle, next } = await searchParams;
  const planLabel = plan ? (PLAN_LABEL[plan] ?? plan) : null;
  const loginHref = plan ? `/login?plan=${plan}&cycle=${cycle ?? "monthly"}` : "/login";
  const nextParam = next ?? (plan ? `/dashboard/pricing?plan=${plan}&cycle=${cycle ?? "monthly"}` : undefined);

  return (
    <AuthShell>
      <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Log in
        </Link>
      </p>
      {planLabel ? (
        <p className="mt-3 rounded-control bg-brand-soft/40 px-3 py-2 text-sm font-medium text-brand">
          You&apos;re starting the {planLabel} trial — 7 days free, no card required.
        </p>
      ) : null}

      <div className="mt-5">
        <FormError message={error} />
      </div>

      <form action={signup} className="mt-5 space-y-4">
        {plan ? <input type="hidden" name="plan" value={plan} /> : null}
        {cycle ? <input type="hidden" name="cycle" value={cycle} /> : null}
        {nextParam ? <input type="hidden" name="next" value={nextParam} /> : null}
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" required className={inputClass} />
        </Field>

        <Field label="Password" htmlFor="password">
          <input id="password" name="password" type="password" required className={inputClass} />
          <p className="mt-1.5 text-xs text-ink-muted">At least 6 characters.</p>
        </Field>

        <PrimaryButton fullWidth>Sign up</PrimaryButton>
      </form>

      <OrDivider />

      <GoogleAuthButton label="Sign up with Google" next={nextParam} />

      <p className="mt-5 text-xs text-ink-muted">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4">
          Terms
        </Link>
        ,{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/refund-policy" className="underline underline-offset-4">
          Refund Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}
