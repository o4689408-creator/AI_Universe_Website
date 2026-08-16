# Production Readiness Checklist

Last verified: Phase 5, against a clean `npm run build` with 21/21
routes statically generated.

## Performance — reviewed

- [x] All 21 routes prerendered as static content (○) or static HTML
      with generateStaticParams (●) — zero routes are server-rendered
      per-request.
- [x] Shared JS across all pages: ~87.3 KB. Heaviest route
      (`/topics/[slug]`): ~106 KB first load.
- [x] All images use `next/image`; the likely LCP element (featured
      homepage/hub card) is marked `priority`.
- [x] Fonts loaded via `next/font` (Geist) — no render-blocking
      third-party font requests.
- [x] YouTube embeds use a lazy facade (thumbnail + click-to-load
      iframe) — zero YouTube iframe weight loads until a reader
      actually clicks play.
- [x] Open Graph images are pre-rendered PNGs at build time
      (`next/og`), not generated per-request.
- [ ] **Not done in this environment:** an actual Lighthouse run. This
      sandbox has no network access to download headless Chrome. Run
      `npx lighthouse <deployed-url> --view` (or Chrome DevTools →
      Lighthouse) after your first deploy and treat this checklist's
      structural items above as the reasons it should score well —
      not a guarantee in place of actually running it.

## Accessibility — reviewed

- [x] Computed WCAG contrast ratios for every text/background token
      pairing; found and fixed one failure (`text-tertiary` was
      3.91:1, now 4.94–5.19:1 after lightening the token — see
      `styles/tokens.css`).
- [x] Skip-to-content link, `<main>` landmark, single `<h1>` per page,
      no skipped heading levels.
- [x] All icon-only buttons have `aria-label`s (menu toggle, search,
      share buttons, video play button).
- [x] Command palette uses `role="dialog"`/`listbox`/`option`,
      keyboard navigation (arrows, Enter, Escape), and focus-on-open.
- [x] Form inputs (newsletter, contact) have associated `<label>`s and
      `aria-invalid`/`role="alert"` on errors.
- [x] `prefers-reduced-motion` respected globally (CSS) and in the
      scroll-reveal component (`AnimatedReveal`).
- [ ] **Recommended before launch:** a manual pass with a screen
      reader (VoiceOver/NVDA) and the axe DevTools browser extension —
      automated contrast checks don't catch everything (e.g. reading
      order, dynamic content announcements).

## Security — reviewed

- [x] Security headers set in `next.config.mjs`: CSP, HSTS,
      X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
      Permissions-Policy — verified present on live responses.
- [x] `npm audit`: fixed a **high-severity RCE advisory** in
      `next-mdx-remote` (upgraded 5.0.0 → 6.0.0) and a moderate
      `postcss` XSS advisory (upgraded to 8.5.19).
- [ ] **Known, deferred:** several Next.js 14.2.35 framework advisories
      remain unpatched in the 14.x line (fixed only in 15.5.16+/16.2.5+).
      Most don't apply to this app's architecture (they concern
      middleware/i18n/rewrites in the Pages Router — this project uses
      neither). **Update, post-Admin-CMS:** the image-optimizer DoS
      advisory was previously reduced by a strict `remotePatterns`
      allow-list; that allow-list was later deliberately widened to any
      HTTPS host (see the comment in `next.config.mjs`) so the Admin CMS
      can accept image URLs from arbitrary legitimate CDNs without a
      redeploy per host. The mitigation for this advisory is now
      server-side SSRF-guarded validation at save time instead (private/
      loopback/link-local hosts and non-HTTPS URLs are rejected — see
      `lib/admin/actions/preview-actions.ts` and
      `lib/admin/validation.ts`), not a narrow `remotePatterns` list. A
      deliberate, tested Next.js major-version upgrade is recommended
      as a near-term follow-up, not bundled into this launch.
- [x] No secrets or API keys in the codebase. **Update, post-Admin-CMS:**
      this list grew well beyond the two client-safe variables noted
      here originally — `MONGODB_URI`, `ADMIN_EMAIL`,
      `ADMIN_PASSWORD_HASH`, and `SESSION_SECRET` are all genuinely
      sensitive and required for the Admin CMS; `RESEND_API_KEY` and
      `WORDS_API_KEY` are optional and sensitive when set. None of them
      are hardcoded anywhere — see `.env.example` for the authoritative,
      current list with usage notes for each.
- [x] No `dangerouslySetInnerHTML` except JSON-LD blocks, which
      serialize only build-time-controlled data (never user input).

## Pre-launch checklist

- [ ] Replace the three placeholder YouTube video IDs in
      `lib/videos.ts` with real ones (see `CONTENT_GUIDE.md`).
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel to your real domain.
- [ ] Update `CONTACT_EMAIL` in `lib/config.ts`.
- [ ] Have `app/legal/privacy/page.tsx` and `app/legal/terms/page.tsx`
      reviewed by a lawyer — they're structurally complete templates,
      not legal advice.
- [ ] Decide on an analytics provider (Plausible is wired as a
      placeholder) and set `NEXT_PUBLIC_ANALYTICS_DOMAIN` if using it.
- [ ] Wire the newsletter form (`sections/NewsletterSection.tsx`) and
      contact form (`components/contact/ContactForm.tsx`) to a real
      backend — both currently simulate success locally by design
      (see the comments in each file for exactly where to plug in a
      provider).
- [ ] Submit `sitemap.xml` to Google Search Console after deploying.
- [ ] Run Lighthouse against the live URL (see Performance section
      above).
