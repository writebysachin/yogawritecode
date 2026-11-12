import posthog from "posthog-js";

// Public project token. NEXT_PUBLIC_* vars are inlined at build time, so a build without the var must still capture.
const DEFAULT_PROJECT_TOKEN = "phc_rCBwSrW7nsp8xoEtfFYeAQWUcR4Kj9GamEHzw2amJsrE";

let initialized = false;

/** Initialize PostHog once. Call only after the visitor accepts analytics cookies. */
export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  let token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) {
    console.warn("[posthog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not set at build time; using the default project token.");
    token = DEFAULT_PROJECT_TOKEN;
  }
  initialized = true;
  posthog.init(token, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "always",
  });
  capturePageView();

  // Fire a deferred signup event if one was queued before init.
  try {
    const raw = sessionStorage.getItem("ph_signup_event");
    if (raw) {
      sessionStorage.removeItem("ph_signup_event");
      sessionStorage.setItem("ph_signup_tracked", "1");
      const { login_type } = JSON.parse(raw) as { login_type?: string };
      posthog.capture("user_signed_up", { login_type: login_type ?? "email", is_free_trial: true });
    }
  } catch {
    // ignore storage/parse issues
  }
}

export { posthog };

/** Capture a $pageview with the current URL — no-op until PostHog is initialized. */
export function capturePageView() {
  if (!initialized || typeof window === "undefined") return;
  posthog.capture("$pageview", { $current_url: window.location.href });
}

/** Capture a named event — no-op until PostHog is initialized (i.e. consent granted). */
export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized || typeof window === "undefined") return;
  posthog.capture(event, properties);
}
