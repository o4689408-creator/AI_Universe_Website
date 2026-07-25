/**
 * Analytics placeholder.
 *
 * No provider is wired up yet — this exists so event-tracking calls can
 * be added throughout the app now (e.g. `trackEvent("newsletter_signup")`)
 * without churn later. When a provider is chosen (blueprint recommends
 * Plausible or Fathom for privacy-friendly analytics), only this file's
 * internals change.
 *
 * The actual script tag is loaded conditionally in
 * components/analytics/Analytics.tsx, only when
 * NEXT_PUBLIC_ANALYTICS_DOMAIN is set — so nothing loads, and no
 * network request fires, until analytics is deliberately configured.
 */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, props ?? {});
    return;
  }

  if (typeof window === "undefined") return;

  const plausible = (
    window as unknown as {
      plausible?: (name: string, opts?: { props?: Record<string, unknown> }) => void;
    }
  ).plausible;

  plausible?.(name, props ? { props } : undefined);
}
