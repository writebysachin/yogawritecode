import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { google } from "googleapis";

export const GOOGLE_OAUTH_STATE_COOKIE = "ywc_google_oauth_state";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
  "openid",
  "email",
  "profile",
];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable.`);
  return value;
}

/**
 * Must exactly match the redirect URI registered in Google Cloud Console:
 * https://app.yogawritecode.com/api/auth/google/callback
 */
export function googleRedirectUri(origin?: string): string {
  if (process.env.GOOGLE_OAUTH_REDIRECT_URI) return process.env.GOOGLE_OAUTH_REDIRECT_URI;
  const base = (origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}/api/auth/google/callback`;
}

export function newOAuthState(): string {
  return randomBytes(16).toString("hex");
}

export function buildGoogleAuthUrl(state: string, origin?: string): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", required("GOOGLE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", googleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  // offline + consent guarantees a refresh_token on every connect.
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleCode(
  code: string,
  origin?: string,
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: required("GOOGLE_CLIENT_ID"),
      client_secret: required("GOOGLE_CLIENT_SECRET"),
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) throw new Error(`Google token exchange failed (${response.status}).`);
  return (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

export async function googleAccountEmail(accessToken: string): Promise<string | null> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const info = (await response.json()) as { email?: string };
  return info.email ?? null;
}

function tokenKey(): Buffer {
  const secret = process.env.GOOGLE_OAUTH_TOKEN_KEY;
  if (!secret) throw new Error("Missing GOOGLE_OAUTH_TOKEN_KEY environment variable.");
  return scryptSync(secret, "ywc-google-oauth", 32);
}

export function encryptToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted token.");
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

export function searchConsoleClient(refreshToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return google.searchconsole({ version: "v1", auth });
}

export async function listSearchConsoleSites(
  refreshToken: string,
): Promise<{ siteUrl: string; permissionLevel: string }[]> {
  const client = searchConsoleClient(refreshToken);
  const { data } = await client.sites.list();
  return (data.siteEntry ?? []).map((site) => ({
    siteUrl: site.siteUrl ?? "",
    permissionLevel: site.permissionLevel ?? "",
  }));
}
