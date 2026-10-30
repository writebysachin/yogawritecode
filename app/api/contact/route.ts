import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Contact form → JotForm "Website form" (263022305057042).
 *
 * The form is submitted through JotForm's REST API rather than its public
 * /submit endpoint: a proxied post to /submit is answered with a captcha
 * challenge, while the API stores the response directly in the JotForm inbox.
 *
 * Requires JOTFORM_API_KEY (JotForm → Settings → API → Create New Key).
 * Field ids come from that form: 3 = name (first/last), 4 = email.
 */
const JOTFORM_ID = "263022305057042";
const NAME_FIELD_ID = "3";
const EMAIL_FIELD_ID = "4";

const bodySchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().max(80).optional(),
  email: z.email({ message: "Enter a valid email address." }).max(320),
});

export async function POST(request: Request) {
  const apiKey = process.env.JOTFORM_API_KEY?.trim();
  if (!apiKey) {
    console.error("[contact] JOTFORM_API_KEY is not configured");
    return NextResponse.json(
      { error: "The form isn't connected yet. Please email hello@yogawritecode.com." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your name and email." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter your name and email." },
      { status: 400 },
    );
  }

  const { firstName, lastName, email } = parsed.data;

  try {
    const upstream = await fetch(
      `https://api.jotform.com/form/${JOTFORM_ID}/submissions?apiKey=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submission: {
            [NAME_FIELD_ID]: { first: firstName, last: lastName ?? "" },
            [EMAIL_FIELD_ID]: email,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );

    const data = (await upstream.json().catch(() => null)) as
      | { responseCode?: number; message?: string }
      | null;

    if (!upstream.ok || data?.responseCode !== 200) {
      console.error(
        `[contact] JotForm API failed: HTTP ${upstream.status} ${data?.message ?? ""}`,
      );
      return NextResponse.json(
        { error: "Couldn't send your message. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] JotForm API request failed", error);
    return NextResponse.json(
      { error: "Couldn't send your message. Please try again." },
      { status: 502 },
    );
  }
}
