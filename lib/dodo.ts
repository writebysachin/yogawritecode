/**
 * Where Dodo sends the customer after payment. Uses the canonical site URL so
 * the landing page stays on the same domain the checkout started on
 * (yogawritecode.com), rather than the app.* alias.
 */
export const DODO_SUCCESS_URL = new URL(
  "/dashboard/payment-success",
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yogawritecode.com",
).toString();

function withRedirect(base: string): string {
  const url = new URL(base);
  if (!url.searchParams.has("redirect_url")) {
    url.searchParams.set("redirect_url", DODO_SUCCESS_URL);
  }
  return url.toString();
}

export type PaidPlanId = "starter" | "pro" | "scale";
export type BillingCycle = "monthly" | "yearly";

export const PLAN_PRICES: Record<PaidPlanId, { monthly: string; yearly: string }> = {
  starter: { monthly: "$9", yearly: "$86" },
  pro: { monthly: "$19", yearly: "$182" },
  scale: { monthly: "$40", yearly: "$384" },
};

export const PLAN_NAMES: Record<PaidPlanId, string> = {
  starter: "Starter",
  pro: "Pro Writer",
  scale: "Scale",
};

export function normalizePlan(value: unknown): PaidPlanId {
  return value === "starter" || value === "pro" || value === "scale" ? value : "pro";
}

export function normalizeCycle(value: unknown): BillingCycle {
  return value === "yearly" ? "yearly" : "monthly";
}

/**
 * Live Dodo product ids for the monthly plans.
 *
 * Yearly billing is a separate product on Dodo — the same product cannot be
 * charged monthly and yearly — so the yearly ids live in their own map below.
 */
export const DODO_PRODUCT_IDS: Record<PaidPlanId, string> = {
  starter: "pdt_0NpdaJfvYRH4No4Adhd7F",
  pro: "pdt_0Np8pi0UC8l26KKHxN9Pc",
  scale: "pdt_0NpdcPj2kwmZyFUWgG2KH",
};

/**
 * Yearly product ids. These are required, not optional: without them a yearly
 * selection silently falls back to the monthly product and the customer is
 * billed monthly for a plan they bought yearly.
 */
const DODO_YEARLY_PRODUCT_IDS: Partial<Record<PaidPlanId, string | undefined>> = {
  starter: process.env.DODO_STARTER_YEARLY_PRODUCT_ID,
  pro: process.env.DODO_PRO_YEARLY_PRODUCT_ID,
  scale: process.env.DODO_SCALE_YEARLY_PRODUCT_ID,
};

/** The Dodo product that should be charged for a plan + billing cycle. */
export function productIdFor(plan: PaidPlanId, cycle: BillingCycle): string {
  if (cycle === "yearly") {
    const yearly = DODO_YEARLY_PRODUCT_IDS[plan]?.trim();
    if (yearly) return yearly;
  }
  return DODO_PRODUCT_IDS[plan];
}

/**
 * Reverse lookup so a Dodo webhook can map a paid product back to an app
 * plan. Covers both the monthly and the yearly product for each plan.
 */
export function planForProduct(productId: string | null | undefined): PaidPlanId | null {
  if (!productId) return null;
  for (const plan of ["starter", "pro", "scale"] as PaidPlanId[]) {
    if (DODO_PRODUCT_IDS[plan] === productId) return plan;
    if (DODO_YEARLY_PRODUCT_IDS[plan]?.trim() === productId) return plan;
  }
  return null;
}

/** Dodo's hosted buy page for a product. */
function hostedLink(productId: string): string {
  return withRedirect(`https://checkout.dodopayments.com/buy/${productId}?quantity=1`);
}

// Hosted links are the fallback used when a checkout session can't be created.
// They are derived from the product ids so the link always points at the same
// product the session would charge. Env vars can still override them.
const DEFAULT_LINKS = {
  starter: hostedLink(DODO_PRODUCT_IDS.starter),
  pro: hostedLink(DODO_PRODUCT_IDS.pro),
  scale: hostedLink(DODO_PRODUCT_IDS.scale),
} as const;

export const DODO_PAYMENT_LINK = DEFAULT_LINKS.pro;

export const DODO_STARTER_LINK = process.env.NEXT_PUBLIC_DODO_STARTER_LINK ?? DEFAULT_LINKS.starter;
export const DODO_PRO_LINK = process.env.NEXT_PUBLIC_DODO_PRO_LINK ?? DEFAULT_LINKS.pro;
export const DODO_SCALE_LINK = process.env.NEXT_PUBLIC_DODO_SCALE_LINK ?? DEFAULT_LINKS.scale;

const DODO_STARTER_YEARLY_LINK =
  process.env.NEXT_PUBLIC_DODO_STARTER_YEARLY_LINK ?? hostedLink(productIdFor("starter", "yearly"));
const DODO_PRO_YEARLY_LINK =
  process.env.NEXT_PUBLIC_DODO_PRO_YEARLY_LINK ?? hostedLink(productIdFor("pro", "yearly"));
const DODO_SCALE_YEARLY_LINK =
  process.env.NEXT_PUBLIC_DODO_SCALE_YEARLY_LINK ?? hostedLink(productIdFor("scale", "yearly"));

/** Matches the environment the secret key belongs to. Defaults to live. */
export function dodoMode(): "test" | "live" {
  return process.env.DODO_ENVIRONMENT?.trim().toLowerCase() === "test" ? "test" : "live";
}

/**
 * Builds a Dodo checkout link for a plan + cycle, prefilled with the
 * signed-in user's email and id. The webhook prefers
 * `metadata_app_user_id` over email so a typo or case difference at
 * checkout can't orphan the payment. `metadata_cycle` records the
 * monthly/yearly choice even when the yearly override link is unset.
 */
export function buildDodoPlanLink(
  plan: PaidPlanId,
  email?: string,
  userId?: string,
  cycle: BillingCycle = "monthly",
): string {
  const monthlyBase =
    plan === "starter" ? DODO_STARTER_LINK : plan === "scale" ? DODO_SCALE_LINK : DODO_PRO_LINK;
  const yearlyBase =
    plan === "starter"
      ? DODO_STARTER_YEARLY_LINK
      : plan === "scale"
        ? DODO_SCALE_YEARLY_LINK
        : DODO_PRO_YEARLY_LINK;
  const base = cycle === "yearly" ? yearlyBase : monthlyBase;
  const url = new URL(withRedirect(base));
  if (email) url.searchParams.set("email", email);
  if (userId) url.searchParams.set("metadata_app_user_id", userId);
  url.searchParams.set("metadata_plan", plan);
  url.searchParams.set("metadata_cycle", cycle);
  return url.toString();
}

/** Legacy single-link builder (Pro). Prefer buildDodoPlanLink(). */
export function buildDodoPaymentLink(email?: string, userId?: string): string {
  return buildDodoPlanLink("pro", email, userId, "monthly");
}
