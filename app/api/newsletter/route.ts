import { NextResponse } from "next/server";
import { z } from "zod";
import https from "https";

/**
 * Newsletter signup proxy.
 *
 * Posts directly to Substack's free-subscribe endpoint using Node's https
 * module (not fetch) so we can intercept the 302 redirect that Substack
 * returns on success — Next.js's patched fetch follows redirects even when
 * redirect:"manual" is set, landing on a 404 and falsely reporting failure.
 */
const SUBSTACK_PUBLICATION = "writebysachin.substack.com";

const bodySchema = z.object({
  email: z.email({ message: "Enter a valid email address." }).max(320),
});

function postToSubstack(formBody: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SUBSTACK_PUBLICATION,
        path: "/api/v1/free?nojs=true",
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "content-length": Buffer.byteLength(formBody),
        },
      },
      (res) => {
        res.resume(); // drain response body
        resolve(res.statusCode ?? 0);
      },
    );
    req.on("error", reject);
    req.setTimeout(10_000, () => {
      req.destroy(new Error("Substack request timed out"));
    });
    req.write(formBody);
    req.end();
  });
}

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

  const formBody = new URLSearchParams({
    email: parsed.data.email.trim(),
    first_url: "https://yogawritecode.com/",
    first_referrer: "",
  }).toString();

  try {
    const statusCode = await postToSubstack(formBody);

    // Substack returns 302 on success; 2xx or 3xx all mean the email was accepted.
    if (statusCode >= 200 && statusCode < 400) {
      return NextResponse.json({ ok: true });
    }

    console.error(`[newsletter] Substack responded ${statusCode}`);
    return NextResponse.json(
      { error: "Couldn't sign you up right now. Please try again." },
      { status: 502 },
    );
  } catch (error) {
    console.error("[newsletter] Substack request failed", error);
    return NextResponse.json(
      { error: "Couldn't sign you up right now. Please try again." },
      { status: 502 },
    );
  }
}
