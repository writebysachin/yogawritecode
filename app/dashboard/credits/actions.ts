"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CARD_BONUS_CREDITS } from "@/lib/plan";

export async function claimCardBonus(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: "Please sign in to claim credits." };

  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("ai_credits_balance, card_bonus_claimed")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (readError) {
    // Migration 20261013000000 not applied yet — don't block the UI.
    if (readError.code === "PGRST204") {
      return { ok: false, message: "Credit ledger is not set up yet. Run the latest migration." };
    }
    return { ok: false, message: "Could not read credit balance." };
  }

  const row = profile as { ai_credits_balance?: number | null; card_bonus_claimed?: boolean | null } | null;
  if (row?.card_bonus_claimed) return { ok: false, message: "Bonus already claimed." };

  const next = (row?.ai_credits_balance ?? 50) + CARD_BONUS_CREDITS;
  const { error: writeError } = await supabase
    .from("profiles")
    .update({ ai_credits_balance: next, card_bonus_claimed: true })
    .eq("id", userData.user.id);

  if (writeError) return { ok: false, message: "Could not claim credits. Try again." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/pricing");
  return { ok: true, message: `+${CARD_BONUS_CREDITS} credits added.` };
}
