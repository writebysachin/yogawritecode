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
