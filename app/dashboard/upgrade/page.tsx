import type { Metadata } from "next";
import { UpgradePanel } from "@/components/billing/upgrade-panel";
import { getSubscription } from "@/lib/billing/subscription";

export const metadata: Metadata = {
  title: "Upgrade",
  robots: { index: false, follow: false },
};

/**
 * Thin server component (TRD FR-6.4): fetch the subscription and the public
 * payment link, then hand both to the presentational panel.
 */
export default async function UpgradePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; plan?: string; cycle?: string; autostart?: string }>;
}) {
  const { error, plan, cycle, autostart } = (await searchParams) ?? {};
  const subscription = await getSubscription();

  // The payment link is public (a hosted buy URL) and is read here so the
  // client component never touches process.env (TRD SEC-6.2).
  const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK?.trim() || null;

  return (
    <UpgradePanel
      subscription={subscription}
      paymentLink={paymentLink}
      error={error}
      plan={plan}
      cycle={cycle}
      autoStart={autostart === "1"}
    />
  );
}
