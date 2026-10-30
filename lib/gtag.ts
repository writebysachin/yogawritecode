/**
 * Thin wrapper around GA4's command queue.
 *
 * gtag.js consumes the `dataLayer` array, reading each command by index, so
 * pushing `[command, ...params]` here works even before the library has
 * finished downloading: gtag.js replays everything it finds in order.
 */
export function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const target = window as Window & { dataLayer?: unknown[] };
  target.dataLayer = target.dataLayer || [];
  target.dataLayer.push(args);
}

/**
 * Grants or revokes analytics storage after the visitor answers the consent
 * banner. gtag.js is already loaded at that point; until this runs, hits are
 * sent without cookies (Consent Mode default = denied).
 */
export function updateAnalyticsConsent(granted: boolean): void {
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}
