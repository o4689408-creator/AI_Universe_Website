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
  "img-src 'self' data: https://i.ytimg.com https://images.unsplash.com",
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
    // YouTube thumbnails + Unsplash (royalty-free article imagery) are
    // the external image sources for v1. Add new hosts deliberately,
    // not with a wildcard.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
