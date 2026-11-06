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
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
      },
    );

    // Substack returns a 302 redirect to the welcome page on success.
    // Following that redirect lands on a 404, so we treat 3xx as success.
    const isSuccess = upstream.status >= 200 && upstream.status < 400;
    if (!isSuccess) {
      // Try to surface a meaningful message from Substack's error payload.
      const upstreamJson = await upstream.json().catch(() => null) as
        | { errors?: Array<{ msg?: string }> }
        | null;
      const substackMsg = upstreamJson?.errors?.[0]?.msg;
      console.error(`[newsletter] Substack responded ${upstream.status}`, substackMsg);
      return NextResponse.json(
        { error: substackMsg ?? "Couldn't sign you up right now. Please try again." },
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
