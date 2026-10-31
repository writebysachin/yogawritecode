import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PLAN_NAMES, type PaidPlanId } from "@/lib/dodo";
import { sendTrialEndedEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const maxDuration = 60;

/** How far back a trial end date may be and still count as "just expired". */
const WINDOW_MS = 24 * 60 * 60 * 1000;
const PER_PAGE = 200;
/** Hard stop so a huge account can never turn one cron run into a long job. */
const MAX_PAGES = 10;

function isPaidPlan(value: unknown): value is PaidPlanId {
  return value === "starter" || value === "pro" || value === "scale";
}

/**
 * Nudges everyone whose no-card trial ran out in the last day and who never
 * turned it into a subscription.
 *
 * The 24-hour window is what keeps this idempotent without a database column:
 * Vercel runs the cron once a day, so a trial end date falls inside the window
 * exactly once and the customer is emailed exactly once. The in-app banner
 * covers anyone the cron misses.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error("[cron trial-expiry] CRON_SECRET is not configured");
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  }

  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[cron trial-expiry] Supabase credentials missing");
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // 1. Collect the users whose trial ended inside the window.
  const candidates: Array<{ id: string; email: string; plan: PaidPlanId; cycle: "monthly" | "yearly" }> = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) {
      console.error("[cron trial-expiry] listUsers failed", error.message);
      return NextResponse.json({ error: "Could not list users." }, { status: 500 });
    }

    const users = data.users ?? [];
    for (const user of users) {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const rawEnd = typeof meta.trial_end === "string" ? meta.trial_end : null;
      if (!rawEnd || !isPaidPlan(meta.trial_plan)) continue;

      const end = new Date(rawEnd).getTime();
      if (Number.isNaN(end) || end > now || end < windowStart) continue;

      const email = user.email?.trim();
      if (!email) continue;

      candidates.push({
        id: user.id,
        email,
        plan: meta.trial_plan,
        cycle: meta.trial_cycle === "yearly" ? "yearly" : "monthly",
      });
    }

    if (users.length < PER_PAGE) break;
  }

  if (candidates.length === 0) {
    return NextResponse.json({ expired: 0, notified: 0, skipped: 0 });
  }

  // 2. Skip anyone who already became a paying customer.
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, dodo_subscription_id")
    .in("id", candidates.map((c) => c.id));

  if (profilesError) {
    console.error("[cron trial-expiry] profiles query failed", profilesError.message);
    return NextResponse.json({ error: "Could not read profiles." }, { status: 500 });
  }

  const subscribed = new Set(
    (profiles ?? [])
      .filter((p) => p.dodo_subscription_id)
      .map((p) => p.id),
  );

  let notified = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    if (subscribed.has(candidate.id)) {
      skipped++;
      continue;
    }
    const result = await sendTrialEndedEmail(candidate.email, {
      plan: candidate.plan,
      planName: PLAN_NAMES[candidate.plan],
      cycle: candidate.cycle,
    });
    if (result.sent) notified++;
    else skipped++;
  }

  console.log(
    `[cron trial-expiry] expired=${candidates.length} notified=${notified} skipped=${skipped}`,
  );
  return NextResponse.json({ expired: candidates.length, notified, skipped });
}
