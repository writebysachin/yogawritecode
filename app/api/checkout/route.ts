import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DODO_SUCCESS_URL,
  buildDodoPlanLink,
  dodoMode,
  normalizeCycle,
  normalizePlan,
  productIdFor,
} from "@/lib/dodo";

/**
 * Creates a Dodo Checkout Session for the embedded checkout page.
 *
 * The secret API key never leaves the server: the browser sends a public
 * plan/cycle pair, this route resolves the allowlisted product id and returns
 * only the session's checkout URL plus the SDK mode.
 *
 * If sessions cannot be created (no key, API error) the response still carries
 * a `fallbackUrl` to the hosted payment link, so a hiccup here never blocks a
 * sale — the client redirects instead of showing a dead end.
 */

const bodySchema = z.object({
  plan: z.string().optional(),
  cycle: z.string().optional(),
});

type CustomerName = string | undefined;

function nameFromMetadata(metadata: Record<string, unknown> | undefined): CustomerName {
  if (!metadata) return undefined;
  for (const key of ["full_name", "name", "display_name"]) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to continue to checkout." }, { status: 401 });
  }

  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    // An empty body is fine — fall back to the defaults.
  }

  const parsed = bodySchema.safeParse(payload ?? {});
  const plan = normalizePlan(parsed.success ? parsed.data.plan : undefined);
  const cycle = normalizeCycle(parsed.success ? parsed.data.cycle : undefined);
  const fallbackUrl = buildDodoPlanLink(plan, user.email, user.id, cycle);

  const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[checkout] DODO_PAYMENTS_API_KEY is not set; falling back to the hosted payment link.",
    );
    return NextResponse.json(
      {
        error: "Embedded checkout isn't configured yet.",
        fallbackUrl,
      },
      { status: 503 },
    );
  }

  const name = nameFromMetadata(user.user_metadata as Record<string, unknown> | undefined);

  try {
    const client = new DodoPayments({
      bearerToken: apiKey,
      environment: dodoMode() === "test" ? "test_mode" : "live_mode",
    });

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productIdFor(plan, cycle), quantity: 1 }],
      customer: { email: user.email, ...(name ? { name } : {}) },
      metadata: { app_user_id: user.id, plan, cycle },
      return_url: DODO_SUCCESS_URL,
      cancel_url: new URL("/checkout", request.url).toString(),
      customization: {
        theme: "light",
        show_order_details: true,
        theme_config: {
          radius: "10px",
          pay_button_text: "Start subscription",
          light: {
            bg_primary: "#ffffff",
            bg_secondary: "#fafaf9",
            border_primary: "#e7e5e4",
            button_primary: "#5b4bdb",
            button_primary_hover: "#4c3dc7",
            button_text_primary: "#ffffff",
            input_focus_border: "#5b4bdb",
            text_primary: "#1c1917",
            text_secondary: "#57534e",
            text_placeholder: "#78716c",
          },
        },
      },
      feature_flags: {
        allow_discount_code: true,
        allow_customer_editing_email: true,
        allow_customer_editing_name: true,
      },
    });

    if (!session.checkout_url) {
      console.error("[checkout] session created without a checkout URL", session.session_id);
      return NextResponse.json(
        { error: "Checkout couldn't be prepared.", fallbackUrl },
        { status: 502 },
      );
    }

    return NextResponse.json({
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
      mode: dodoMode(),
    });
  } catch (error) {
    console.error("[checkout] session creation failed", error);
    return NextResponse.json(
      { error: "Checkout couldn't be prepared.", fallbackUrl },
      { status: 502 },
    );
  }
}
