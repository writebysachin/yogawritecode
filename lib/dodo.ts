export const DODO_PAYMENT_LINK =
  "https://checkout.dodopayments.com/buy/pdt_0Np8pi0UC8l26KKHxN9Pc?quantity=1&redirect_url=https://app.yogawritecode.com%2Fdashboard%2Fpayment-success";

export const DODO_SUCCESS_URL = "https://app.yogawritecode.com/dashboard/payment-success";

// Per-tier checkout links. Set these in env when Dodo products exist;
// all fall back to the single live link so the UI never breaks.
export const DODO_STARTER_LINK =
  process.env.NEXT_PUBLIC_DODO_STARTER_LINK ?? DODO_PAYMENT_LINK;
export const DODO_PRO_LINK = process.env.NEXT_PUBLIC_DODO_PRO_LINK ?? DODO_PAYMENT_LINK;
export const DODO_SCALE_LINK =
  process.env.NEXT_PUBLIC_DODO_SCALE_LINK ?? DODO_PAYMENT_LINK;

export type PaidPlanId = "starter" | "pro" | "scale";

export function buildDodoPlanLink(
  plan: PaidPlanId,
  email?: string,
  userId?: string,
): string {
  const base =
    plan === "starter" ? DODO_STARTER_LINK : plan === "scale" ? DODO_SCALE_LINK : DODO_PRO_LINK;
  const url = new URL(base);
  if (email) url.searchParams.set("email", email);
  if (userId) url.searchParams.set("metadata_app_user_id", userId);
  url.searchParams.set("metadata_plan", plan);
  return url.toString();
}

/**
 * Builds a static Dodo payment link prefilled with the signed-in user's
 * email and id. The webhook prefers `metadata_app_user_id` over email so a
 * typo or case difference at checkout can't orphan the payment.
 */
export function buildDodoPaymentLink(email?: string, userId?: string): string {
  const url = new URL(DODO_PAYMENT_LINK);
  if (email) url.searchParams.set("email", email);
  if (userId) url.searchParams.set("metadata_app_user_id", userId);
  return url.toString();
}
