export const DODO_SUCCESS_URL = "https://app.yogawritecode.com/dashboard/payment-success";

function withRedirect(base: string): string {
  const url = new URL(base);
  if (!url.searchParams.has("redirect_url")) {
    url.searchParams.set("redirect_url", DODO_SUCCESS_URL);
  }
  return url.toString();
}

// Live Dodo products. Env vars override when set; hardcoded links are the
// fallback so checkout works without extra configuration.
const DEFAULT_LINKS = {
  starter: withRedirect("https://checkout.dodopayments.com/buy/pdt_0NpdaJfvYRH4No4Adhd7F?quantity=1"),
  pro: withRedirect("https://checkout.dodopayments.com/buy/pdt_0Np8pi0UC8l26KKHxN9Pc?quantity=1"),
  scale: withRedirect("https://checkout.dodopayments.com/buy/pdt_0NpdcPj2kwmZyFUWgG2KH?quantity=1"),
} as const;

export const DODO_PAYMENT_LINK = DEFAULT_LINKS.pro;

export const DODO_STARTER_LINK = process.env.NEXT_PUBLIC_DODO_STARTER_LINK ?? DEFAULT_LINKS.starter;
export const DODO_PRO_LINK = process.env.NEXT_PUBLIC_DODO_PRO_LINK ?? DEFAULT_LINKS.pro;
export const DODO_SCALE_LINK = process.env.NEXT_PUBLIC_DODO_SCALE_LINK ?? DEFAULT_LINKS.scale;

export type PaidPlanId = "starter" | "pro" | "scale";

/**
 * Builds a Dodo checkout link for a plan, prefilled with the signed-in user's
 * email and id. The webhook prefers `metadata_app_user_id` over email so a
 * typo or case difference at checkout can't orphan the payment.
 */
export function buildDodoPlanLink(plan: PaidPlanId, email?: string, userId?: string): string {
  const base = plan === "starter" ? DODO_STARTER_LINK : plan === "scale" ? DODO_SCALE_LINK : DODO_PRO_LINK;
  const url = new URL(withRedirect(base));
  if (email) url.searchParams.set("email", email);
  if (userId) url.searchParams.set("metadata_app_user_id", userId);
  url.searchParams.set("metadata_plan", plan);
  return url.toString();
}

/** Legacy single-link builder (Pro). Prefer buildDodoPlanLink(). */
export function buildDodoPaymentLink(email?: string, userId?: string): string {
  return buildDodoPlanLink("pro", email, userId);
}
