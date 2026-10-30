import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Newsletter signup proxy.
 *
 * The footer form posts here instead of straight to Substack so the browser
 * never deals with CORS, and a failed subscription can be reported to the
 * visitor instead of silently swallowed. Substack's free-subscribe endpoint
 * expects form-encoded input.
 */
const SUBSTACK_PUBLICATION = "writebysachin.substack.com";

const bodySchema = z.object({
  email: z.email({ message: "Enter a valid email address." }).max(320),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
      { status: 400 },
    );
  }

  const body = new URLSearchParams({
    email: parsed.data.email.trim(),
    first_url: "https://yogawritecode.com/",
    first_referrer: "",
  });

  try {
    const upstream = await fetch(
      `https://${SUBSTACK_PUBLICATION}/api/v1/free?nojs=true`,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!upstream.ok) {
      console.error(`[newsletter] Substack responded ${upstream.status}`);
      return NextResponse.json(
        { error: "Couldn't sign you up right now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[newsletter] Substack request failed", error);
    return NextResponse.json(
      { error: "Couldn't sign you up right now. Please try again." },
      { status: 502 },
    );
  }
}
