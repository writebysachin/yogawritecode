export const DODO_PAYMENT_LINK =
  "https://checkout.dodopayments.com/buy/pdt_0Np8pi0UC8l26KKHxN9Pc?quantity=1&redirect_url=https://app.yogawritecode.com%2Fdashboard%2Fpayment-success";

export const DODO_SUCCESS_URL = "https://app.yogawritecode.com/dashboard/payment-success";

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
