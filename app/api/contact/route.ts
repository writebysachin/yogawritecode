import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email/resend";

/**
 * Contact form delivery.
 *
 * Submissions are emailed to the team inbox through Resend (CONTACT_EMAIL,
 * default hello@yogawritecode.com) with the visitor's address as Reply-To,
 * so the custom-designed form needs no third-party form service.
 */
const bodySchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().max(80).optional(),
  email: z.email({ message: "Enter a valid email address." }).max(320),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(5_000, "That message is too long (5,000 characters max)."),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your name, email and message." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter your name, email and message." },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, message } = parsed.data;
  const result = await sendContactEmail({ firstName, lastName, email, message });

  if (result.sent) {
    return NextResponse.json({ ok: true });
  }

  if (result.skipped) {
    console.error("[contact] email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)");
    return NextResponse.json(
      { error: "The form isn't connected yet. Please email hello@yogawritecode.com." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { error: "Couldn't send your message. Please try again." },
    { status: 502 },
  );
}
