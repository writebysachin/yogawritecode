/**
 * Consent-gated tags: Google Tag Manager and Microsoft Clarity.
 *
 * Neither script is requested, and no third-party cookie is set, until the
 * visitor accepts. The choice is kept in localStorage and can be reopened at any
 * time from the "Cookie settings" link in the site footer.
 *
 * Exposed as an external store so components can read it through
 * `useSyncExternalStore` without setting state inside an effect.
 */

/** GTM container ID. Set to an empty value to disable Tag Manager. */
const configuredContainerId: string =
  process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? "GTM-K8MFHGSC";

/**
 * Microsoft Clarity project ID. Set to an empty value to disable Clarity.
 */
const configuredClarityId: string =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "yo9d18nwgq";

/**
 * GA4 measurement ID of the "Web" data stream, loaded through gtag.js by
 * <GoogleTag /> in the root layout. Set to an empty value to disable it.
 *
 * GA4 is the one tag that loads before the consent banner is answered, because
 * it runs in Consent Mode with storage denied — hits arrive without cookies and
 * gain the first-party cookie only when the visitor accepts. gtag.js is skipped
 * once the GTM container reports GA4 itself (NEXT_PUBLIC_GTM_FIRES_GA4=true),
 * since running both would count every pageview twice.
 */
const configuredGaMeasurementId: string =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-HE58ZZSJPW";

const gtmFiresGa4: boolean =
  (process.env.NEXT_PUBLIC_GTM_FIRES_GA4 ?? "false").trim().toLowerCase() === "true";

export const gtmContainerId: string | null = configuredContainerId.trim() || null;
export const clarityProjectId: string | null = configuredClarityId.trim() || null;
export const gaMeasurementId: string | null = gtmFiresGa4
  ? null
  : configuredGaMeasurementId.trim() || null;

/**
 * Dashboard routes are excluded from Clarity recordings: they hold customer
 * content (drafts, submitted website URLs) that the privacy policy does not
 * share with third parties. `/auth` holds OAuth callback tokens.
 */
export const clarityExcludedPaths: readonly string[] = ["/dashboard*", "/auth*"];

/** Redacts anything the visitor types, so recordings never show form values. */
export const clarityMaskedSelectors: readonly string[] = ["input", "textarea", "select"];

export type ConsentDecision = "granted" | "denied";

const CONSENT_KEY = "ywc.analytics-consent";

type ConsentListener = () => void;

const listeners = new Set<ConsentListener>();

function announce(): void {
  for (const listener of listeners) listener();
}

export function subscribeToConsent(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The stored decision, or null while the visitor has not chosen. */
export function getConsentSnapshot(): ConsentDecision | null {
  if (typeof window === "undefined") return null;
  const stored: string | null = window.localStorage.getItem(CONSENT_KEY);
  return stored === "granted" || stored === "denied" ? stored : null;
}

/** Server snapshot. The choice only exists in the browser, so report "unknown". */
export function getConsentServerSnapshot(): null {
  return null;
}

/** Persists the choice. Subscribers pick the change up from `announce()`. */
export function saveAnalyticsConsent(decision: ConsentDecision): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, decision);
  announce();
}

/** Forgets the choice so the banner can ask again. */
export function clearAnalyticsConsent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONSENT_KEY);
  announce();
}

/**
 * Empty subscription used to tell server rendering from client rendering. The
 * banner must stay out of the server HTML, otherwise a returning visitor who
 * already declined would see it flash before hydration removes it.
 */
export function subscribeToHydration(): () => void {
  return () => {};
}

export function getHydratedSnapshot(): boolean {
  return true;
}

export function getServerHydratedSnapshot(): boolean {
  return false;
}
