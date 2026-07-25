import Script from "next/script";

/**
 * Renders nothing until NEXT_PUBLIC_ANALYTICS_DOMAIN is set in the
 * environment. This keeps the site's default "no invasive tracking"
 * posture (per the design system's UX principles) while making real
 * analytics a one-environment-variable change, not a code change.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
