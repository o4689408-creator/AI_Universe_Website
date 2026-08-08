/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// Pragmatic CSP for a Next.js App Router site: 'unsafe-inline' on script-src
// is required for Next's hydration data and this site's JSON-LD blocks
// (both trusted, build-time-controlled content — never user input).
// 'unsafe-eval' is added ONLY in development — Next's Hot Module Reload /
// React Refresh runtime evaluates code via eval(), and without this the
// entire client bundle silently fails to execute in `next dev` (no click
// handlers, no interactivity, no console error unless you check DevTools).
// Production builds don't use eval() for this, so the production CSP stays
// exactly as strict as it was.
// Tightening further to a nonce-based CSP is a reasonable follow-up once
// the site is deployed and the exact script inventory is finalized.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://plausible.io`,
  "style-src 'self' 'unsafe-inline'",
  // Widened from a fixed allow-list to any HTTPS host: the Admin CMS
  // lets the operator paste an arbitrary Hero/Featured Image URL for
  // every new article, so the previous two-domain allow-list would
  // have silently blocked most pasted images from ever rendering.
  // Every other directive below stays exactly as strict as before —
  // this only widens where *images* may load from, not scripts,
  // frames, or connections.
  "img-src 'self' data: https:",
  "font-src 'self'",
  `connect-src 'self' https://plausible.io ${isDev ? "ws://localhost:* http://localhost:*" : ""}`,
  "frame-src https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
]
  .map((directive) => directive.replace(/\s+/g, " ").trim())
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Any HTTPS host is allowed here on purpose (not the previous
    // fixed two-domain list): the Admin CMS accepts a pasted image URL
    // for every article's Hero/Featured Image, from whatever host the
    // operator happens to be linking to, and next/image refuses to
    // optimize any host not listed here. The CSP img-src directive
    // above was widened to match. If a tighter allow-list is ever
    // wanted again (e.g. once articles are only ever illustrated from
    // a known image host or your own storage), narrow both back down
    // together.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
