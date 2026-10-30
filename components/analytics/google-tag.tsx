"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { gtag } from "@/lib/gtag";

/**
 * Google Analytics 4 through gtag.js.
 *
 * Loaded on every page, like Google's own snippet, so hits reach GA4 without
 * waiting for the consent banner. Consent Mode is set to "denied" before the
 * first hit, so no analytics cookie is written until the visitor accepts;
 * accepting calls `gtag('consent', 'update', …)` for the first-party cookie.
 *
 * The loader is one inline script on purpose: it defines `gtag`, queues the
 * consent default plus the `config` call, and only then injects gtag.js, so the
 * command order is guaranteed without relying on two <Script> tags arriving in
 * sequence.
 *
 * `send_page_view` stays at its default, which reports the landing pageview.
 * Client-side navigations are reported by <GaPageView />, which skips that
 * first URL — so every URL is counted exactly once.
 */
export function GoogleTag({ measurementId }: { measurementId: string }) {
  return (
    <Script id="ga4-loader" strategy="afterInteractive">
      {`
        (function(w,d){
          w.dataLayer = w.dataLayer || [];
          function gtag(){w.dataLayer.push(arguments);}
          w.gtag = w.gtag || gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${measurementId}');
          var s = d.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtag/js?id=${measurementId}';
          d.head.appendChild(s);
        })(window, document);
      `}
    </Script>
  );
}

/**
 * Fires a GA4 `page_view` on every client-side route change. Next.js keeps the
 * document alive between navigations, so gtag's automatic pageview only covers
 * the first URL.
 */
export function GaPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The URL gtag already reported (the first render's) is remembered instead of
  // a plain "first run" flag, so React's development-only effect replay on mount
  // cannot report the landing page a second time.
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (lastUrl.current === url) return;

    const isLandingPage = lastUrl.current === null;
    lastUrl.current = url;
    if (isLandingPage) return;

    gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: url,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
