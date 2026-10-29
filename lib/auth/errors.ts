/** Translate raw ?error= codes from Supabase/Google into human-readable text. */
export function friendlyAuthError(raw?: string): string | undefined {
  if (!raw) return undefined;
  const decoded = decodeURIComponent(raw);
  if (/access_denied|403/i.test(decoded)) {
    return "Google blocked this sign-in (Error 403: access_denied). The OAuth consent screen is still in Testing mode — add this email under Google Cloud Console → APIs & Services → OAuth consent screen → Audience → Test users, or complete verification to publish the app.";
  }
  return decoded;
}
