import type { Metadata } from "next";
import { UpgradePanel } from "@/components/billing/upgrade-panel";
import { getSubscription } from "@/lib/billing/subscription";
import { normalizeCycle, normalizePlan } from "@/lib/dodo";

export const metadata: Metadata = {
  title: "Upgrade",
  robots: { index: false, follow: false },
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; plan?: string; cycle?: string; autostart?: string }>;
}) {
  const { error, plan, cycle, autostart } = (await searchParams) ?? {};
  const subscription = await getSubscription();

  const safePlan = normalizePlan(plan);
  const safeCycle = normalizeCycle(cycle);

  return (
    <UpgradePanel
      subscription={subscription}
      error={error}
      plan={safePlan}
      cycle={safeCycle}
      autoStart={autostart === "1"}
    />
  );
}
