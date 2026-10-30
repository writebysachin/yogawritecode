import { Resend } from "resend";

/**
 * Resend wiring for signup email.
 *
 * Server-only by construction: this is imported from a "use server" action and a
 * route handler, never from a client component. RESEND_API_KEY has no
 * NEXT_PUBLIC_ prefix, so Next.js replaces it with undefined in client bundles
 * even if this module were ever pulled in by mistake.
 *
 * Nothing here should ever break signup: every send is best-effort and logs on
 * failure instead of throwing. If Resend is not configured, sending is skipped
 * rather than crashing the request.
 */

const apiKey: string | undefined = process.env.RESEND_API_KEY;

/** e.g. "Yoga Write Code <hello@notifications.yogawritecode.com>". */
const from: string | undefined = process.env.RESEND_FROM_EMAIL;

const siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yogawritecode.com";

/** Absolute link helper so templates never emit a relative href. */
function absolute(path: string): string {
  return new URL(path, siteUrl).toString();
}

export type EmailResult = { sent: boolean; skipped?: boolean; error?: string };

async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<EmailResult> {
  if (!apiKey || !from) {
    console.warn(
      "[email] skipped: set RESEND_API_KEY and RESEND_FROM_EMAIL to send email"
    );
    return { sent: false, skipped: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });

    if (error) {
      console.error("[email] resend send failed:", error.message);
      return { sent: false, error: error.message };
    }

    return { sent: true };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "unknown error";
    console.error("[email] resend threw:", message);
    return { sent: false, error: message };
  }
}

/**
 * Inline-styled HTML. Email clients strip <style> blocks and do not support
 * Tailwind classes, so the brand tokens are repeated as literal hex here.
 */
function shell({ heading, intro, cta, footnote }: {
  heading: string;
  intro: string;
  cta: { label: string; href: string };
  footnote: string;
}): string {
  const brand = "#5b4bdb";
  const brandHover = "#4c3dc7";
  const ink = "#1c1917";
  const inkSecondary = "#57534e";
  const inkMuted = "#78716c";
  const line = "#e7e5e4";
  const surfaceSubtle = "#f5f5f4";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${line};border-radius:10px;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${brand};">Yoga Write Code</p>
                <h1 style="margin:16px 0 0 0;font-size:24px;line-height:1.2;font-weight:600;color:${ink};">${heading}</h1>
                <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:${inkSecondary};">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="background:${surfaceSubtle};border-radius:8px;">
                  <tr><td style="padding:16px 20px;font-size:14px;line-height:1.6;color:${inkSecondary};">
                    <strong style="color:${ink};">Your five-step workflow</strong>
                    <br />Analyze &rarr; Opportunities &rarr; Clusters &rarr; Briefs &rarr; Outlines
                  </td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr><td style="border-radius:6px;background:${brand};">
                    <a href="${cta.href}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">${cta.label}</a>
                  </td></tr>
                </table>
                <p style="margin:12px 0 0 0;font-size:13px;color:${inkMuted};">Button not working? Paste this link into your browser:<br /><a href="${cta.href}" style="color:${brandHover};">${cta.href}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 32px 32px;border-top:1px solid ${line};margin-top:28px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${inkMuted};">${footnote}</p>
                <p style="margin:8px 0 0 0;font-size:12px;color:${inkMuted};">
                  <a href="${absolute("/privacy")}" style="color:${inkMuted};">Privacy Policy</a>
                  &nbsp;&middot;&nbsp;
                  <a href="${absolute("/terms")}" style="color:${inkMuted};">Terms</a>
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:12px;color:${inkMuted};">Yoga Write Code &middot; ${siteUrl.replace(/^https?:\/\//, "")}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Sent once, after the address is confirmed (or straight away if unconfirmed). */
export function sendWelcomeEmail(to: string): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: "Welcome to Yoga Write Code",
    html: shell({
      heading: "Your workspace is ready.",
      intro:
        "Paste a website URL to find the content opportunities your business is best placed to write about, then take each one through a brief and an outline.",
      cta: { label: "Open your workspace", href: absolute("/dashboard") },
      footnote:
        "You are receiving this because you created a Yoga Write Code account. If you did not, you can ignore this email.",
    }),
  });
}

/** Escapes visitor input before it is interpolated into the email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "Sachin Pandey" → "SP"; falls back to the first letter of the address. */
function initials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0]?.[0] ?? email[0] ?? "?";
  return letters.toUpperCase();
}

/** Stable, locale-independent stamp: "30 Oct 2026, 10:35 UTC". */
function utcTimestamp(): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${date}, ${time} UTC`;
}

/**
 * Delivers a /contact submission to the team inbox, with the visitor's address
 * as Reply-To so answering is just "Reply". CONTACT_EMAIL overrides the
 * recipient; RESEND_FROM_EMAIL must be on a domain verified in Resend.
 */
export function sendContactEmail(input: {
  firstName: string;
  lastName?: string;
  email: string;
  message: string;
}): Promise<EmailResult> {
  const to = process.env.CONTACT_EMAIL?.trim() || "hello@yogawritecode.com";
  const name = [input.firstName, input.lastName].filter(Boolean).join(" ");
  const displayName = name || input.email;
  const received = utcTimestamp();
  const preheader = input.message.replace(/\s+/g, " ").trim().slice(0, 120);
  const bodyHtml = escapeHtml(input.message).replace(/\r?\n/g, "<br />");
  const replyHref = `mailto:${escapeHtml(input.email)}?subject=${encodeURIComponent(
    "Re: your message to Yoga Write Code",
  )}`;

  return sendEmail({
    to,
    replyTo: name ? `${name} <${input.email}>` : input.email,
    subject: `New contact message from ${displayName}`,
    text: [
      "New contact message",
      "",
      `Name:     ${displayName}`,
      `Email:    ${input.email}`,
      `Received: ${received}`,
      "",
      "Message",
      "-------",
      input.message,
      "",
      `Reply to this email to answer ${displayName} directly.`,
      `Sent from the contact form on ${siteUrl}`,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>New contact message</title>
  </head>
  <body style="margin:0;padding:0;width:100%;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#fafaf9;">${escapeHtml(preheader)}&#8203;${"&#8203;".repeat(20)}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;">
      <tr>
        <td align="center" style="padding:36px 16px;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;">

            <!-- brand accent -->
            <tr>
              <td height="4" style="height:4px;line-height:4px;font-size:0;background:#5b4bdb;">&nbsp;</td>
            </tr>

            <!-- header -->
            <tr>
              <td style="padding:22px 28px;border-bottom:1px solid #e7e5e4;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" valign="middle" style="width:40px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="36" height="36" align="center" valign="middle" bgcolor="#5b4bdb" style="width:36px;height:36px;background:#5b4bdb;border-radius:9px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;line-height:36px;">
                            Y
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="left" valign="middle" style="padding-left:12px;font-size:15px;font-weight:600;color:#1c1917;letter-spacing:-0.01em;">
                      Yoga Write Code
                    </td>
                    <td align="right" valign="middle">
                      <span style="display:inline-block;padding:5px 10px;background:#eeecff;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#5b4bdb;">New message</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- body -->
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:600;color:#1c1917;letter-spacing:-0.015em;">
                  ${escapeHtml(displayName)} sent you a message
                </h1>
                <p style="margin:8px 0 0 0;font-size:14px;line-height:1.6;color:#57534e;">
                  Submitted through the contact form on
                  <a href="${absolute("/contact")}" style="color:#5b4bdb;text-decoration:none;">yogawritecode.com/contact</a>.
                </p>
              </td>
            </tr>

            <!-- sender -->
            <tr>
              <td style="padding:20px 28px 0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;">
                  <tr>
                    <td width="48" valign="middle" style="padding:14px 0 14px 16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="40" height="40" align="center" valign="middle" bgcolor="#eeecff" style="width:40px;height:40px;background:#eeecff;border-radius:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#5b4bdb;line-height:40px;">
                            ${escapeHtml(initials(displayName, input.email))}
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td valign="middle" style="padding:14px 16px 14px 12px;">
                      <div style="font-size:15px;font-weight:600;line-height:1.35;color:#1c1917;">${escapeHtml(displayName)}</div>
                      <div style="margin-top:2px;font-size:13px;line-height:1.35;">
                        <a href="mailto:${escapeHtml(input.email)}" style="color:#57534e;text-decoration:none;">${escapeHtml(input.email)}</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- message -->
            <tr>
              <td style="padding:24px 28px 0 28px;">
                <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#78716c;">Message</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;border-left:3px solid #5b4bdb;border-radius:0 8px 8px 0;">
                  <tr>
                    <td style="padding:18px 20px;font-size:15px;line-height:1.7;color:#1c1917;">
                      ${bodyHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- reply -->
            <tr>
              <td style="padding:26px 28px 28px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="#5b4bdb" style="background:#5b4bdb;border-radius:8px;">
                      <a href="${replyHref}" style="display:inline-block;padding:13px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:8px;">
                        Reply to ${escapeHtml(input.firstName)}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:14px 0 0 0;font-size:13px;line-height:1.6;color:#78716c;">
                  Hitting reply works too &mdash; ${escapeHtml(input.email)} is already set as the recipient.
                </p>
              </td>
            </tr>

            <!-- footer -->
            <tr>
              <td style="padding:18px 28px;background:#fafaf9;border-top:1px solid #e7e5e4;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="font-size:12px;line-height:1.6;color:#78716c;">
                      Received ${received}
                    </td>
                    <td align="right" style="font-size:12px;line-height:1.6;color:#78716c;">
                      <a href="${absolute("/")}" style="color:#78716c;text-decoration:underline;">yogawritecode.com</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>

          <p style="margin:16px 0 0 0;font-size:11px;line-height:1.6;color:#a8a29e;">
            You are receiving this because someone used the contact form on your site.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });
}
