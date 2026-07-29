# AI Universe — Website Owner Manual

Everything you need to run this exact site day-to-day, written against
the real files in this project — not generic Next.js advice. A note on
screenshots: this manual was written in an environment without a
browser available to capture real screenshots, so instructions below
use exact file paths and code examples instead, which are more
reliable to follow anyway.

For the day-to-day publishing workflow specifically (add/edit/delete
an article, connect a video), see **`EDITOR_GUIDE.md`** — this manual
covers everything around that: branding, design, integrations, and
deployment.

---

## Before you launch — required setup

All of these live in **`lib/config.ts`** unless noted otherwise. Open
that file first; every value is documented inline.

1. **Brand & contact** — `SITE_NAME`, `SITE_URL`, `CONTACT_EMAIL`,
   `YOUTUBE_CHANNEL_URL`, `INSTAGRAM_URL`, `LINKEDIN_URL`, `X_URL` are
   all set already; update any that change.
2. **Gmail contact button** — the floating button, footer link, and
   Contact page CTA all open a `mailto:` link to `CONTACT_EMAIL` with
   a prefilled subject/body (see `GMAIL_DEFAULT_SUBJECT` /
   `GMAIL_DEFAULT_BODY` in `lib/config.ts`). This works with zero
   setup — it opens whatever mail app is already the visitor's
   default (Gmail, Outlook, Apple Mail, etc.).
3. **Newsletter** — the subscribe forms (homepage, footer) call
   `app/api/newsletter/route.ts`, which needs `RESEND_API_KEY` and
   `RESEND_AUDIENCE_ID` set as environment variables (see
   `.env.example`). Get both from https://resend.com. Until they're
   set, the form shows a clear "not configured yet" message instead of
   silently losing subscribers.
4. **Contact form** — `app/api/contact/route.ts` needs the same
   `RESEND_API_KEY` plus `RESEND_FROM` (a sender address Resend will
   accept — `onboarding@resend.dev` works for testing before you
   verify your own domain).
5. **Dictionary lookup** (select a word in an article) works out of
   the box using a free, no-key provider. For a richer English dataset,
   optionally set `WORDS_API_KEY` — see `app/api/dictionary/route.ts`
   for details.
6. **Notifying subscribers when you publish — fully automatic.**
   `.github/workflows/notify-subscribers.yml` runs on every `git push`
   to `main` that touches `content/topics/**` or `lib/videos.ts`. It
   diffs the push to find newly *added* article files and any new
   video slugs in `lib/videos.ts`, then emails your Resend Audience
   via Broadcasts for each one — see `scripts/notify-from-git-diff.mjs`
   for exactly how it decides what's new. You publish by pushing to
   `main` (which is also how Vercel deploys the site), and the email
   goes out on its own — nothing to run by hand.

   **One-time setup** (GitHub repo -> Settings -> Secrets and variables
   -> Actions -> "New repository secret"), add:
   - `RESEND_API_KEY`
   - `RESEND_AUDIENCE_ID`
   - `RESEND_FROM`
   - `NEXT_PUBLIC_SITE_URL` (your production domain, so email links
     point to the live site)

   These are the exact same values you already set in Vercel for the
   newsletter/contact forms — you're just copying them into GitHub's
   secrets as well, since GitHub Actions runs in its own environment
   and can't read Vercel's.

   **Manual override** (resending, or publishing through a path that
   doesn't push to `main`):
   ```bash
   npm run notify -- --topic your-new-article-slug
   npm run notify -- --video your-new-video-slug
   ```

   **Known edge case, stated plainly:** on a brand-new repository's
   very first push (or after a force-push), GitHub can't give the
   workflow a valid "before" commit to diff against. The workflow
   detects this and skips automatically (logs why) rather than
   guessing and potentially emailing your list about every existing
   article at once — use the manual command above for that first
   batch instead.

None of the above block a successful build or deploy — they only
gate the specific feature they power.

---

## Folder structure (what matters to you as the owner)

```
ai-universe/
├── content/topics/*.mdx        Your articles — one file per article
├── lib/
│   ├── config.ts                Site name, contact email, social URLs
│   ├── videos.ts                 YouTube video registry
│   ├── authors.ts                 Author bios
│   └── recommendations.ts       "Explore Your AI Journey" interests
├── public/images/topics/*      Article hero images/diagrams
├── styles/tokens.css            Colors, spacing, shadows — the design system
├── tailwind.config.ts            Font families, animation timing
├── app/layout.tsx                Fonts, global page wrapper
├── components/layout/
│   ├── Logo.tsx                    The brand mark + wordmark
│   └── FollowLinks.tsx           Social "follow us" icons
├── sections/NewsletterSection.tsx   Newsletter signup form
└── components/contact/ContactForm.tsx  Contact form
```

---

## 1. Articles — images and diagrams

**Where they go:** `public/images/topics/your-image-name.svg` (PNG/JPG
also work — just match the extension in your frontmatter).

**How to add one:** drag the file into that folder, then reference it
in your article's frontmatter:
```
heroImageUrl: "/images/topics/your-image-name.png"
```
or inline in the article body:
```
<Figure src="/images/topics/your-diagram.png" alt="What this shows" caption="Caption text" />
```
No resizing needed beforehand — `next/image` (used everywhere here)
optimizes and serves the right size automatically.

## 2. YouTube videos — uploading and connecting

You still upload the actual video file to YouTube directly (that part
is entirely on YouTube's side, unrelated to this codebase). Once it's
live, connect it here:

1. Copy the video's YouTube ID (the part after `v=` in the URL).
2. Open **`lib/videos.ts`** and add or edit an entry:
   ```ts
   {
     id: "your-article-slug",
     slug: "your-article-slug",
     title: "Your Video Title",
     youtubeId: "dQw4w9WgXcQ",
     publishedAt: "2026-08-01",
     thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
     companionTopicSlug: "your-article-slug",
   }
   ```
3. In the matching article's frontmatter, set `companionVideoId:
   "your-article-slug"` (same `id` as above).
4. In the article body, add `<VideoEmbed videoId="your-article-slug" />`
   wherever you want it to appear.

That's the entire connection — see `CONTENT_GUIDE.md` §5 for more.

## 3. Changing the homepage

The homepage is assembled in **`app/page.tsx`** as a simple list of
sections:
```tsx
<HeadlineTicker topics={topics} />
<HeroSection />
<DiscoverySection topics={topics} />
<ContinueExploringSection topics={topics} />
<FeaturedTopicSection topics={topics} />
<LatestContentSection topics={topics} />
<YouTubeSection videos={videos} />
<NewsletterSection />
```
To reorder, remove, or add sections, edit this list directly — each
section is a self-contained component in `sections/`. To change the
hero headline/subtext, edit `sections/HeroSection.tsx`.

## 4. Changing the featured article

The homepage's big "Featured" card and the `/topics` "Trending"
section both currently work off simple, predictable rules rather than
manual picks:

- **Featured card**: always your most recently published article
  (by `publishedAt`). To feature an older article, move its
  `publishedAt` date forward. There's no separate manual override
  switch today — see `EDITOR_GUIDE.md` Q6 for the small code change
  needed if you want one.
- **Trending section** (on `/topics`): shows any article with
  `trending: true` in its frontmatter; falls back to the 3 most recent
  if none are flagged. To mark an article trending, add `trending:
  true` to its frontmatter (see `content/topics/inside-large-language-models.mdx`
  for a live example).

## 5. Managing search

Search is fully automatic — every article in `content/topics/` is
searchable the moment its file exists, indexed on title, subtitle,
category, tags, and author. There's no separate search index to
maintain or rebuild. The engine itself lives in **`lib/search.tsx`**;
you generally never need to touch it unless you want to change how
results are ranked (the `WEIGHTS` object at the top of that file).

## 6. Managing categories and tags

Both are plain frontmatter fields on each article — there's no
separate place they're "registered." Categories are typically one
per article (e.g. `"AI Foundations"`, `"Models"`, `"Frontier AI"`);
tags are a list (e.g. `["llms", "inference", "training"]`). Use
consistent spelling/casing across articles so filtering and search
work as expected — there's currently no dropdown of "existing
categories" to pick from, so it's worth keeping a mental (or a
sticky-note) list as you add more.

## 7. Changing the logo

The brand mark and wordmark are one component: **`components/layout/Logo.tsx`**.
- To change the wordmark text, edit `SITE_NAME` in `lib/config.ts`
  (used everywhere, not just the logo).
- To change the mark itself (the small node-graph icon), edit the
  inline SVG in `Logo.tsx`. The same shape is also used for the
  favicon at `app/icon.svg` — update both together if you change it,
  so the browser tab icon matches the header.

## 8. Changing colors

Every color in the entire site is a CSS variable in one file:
**`styles/tokens.css`**. For example, to change the accent color from
blue to something else:
```css
--color-accent: #4C7DFF;   /* change this */
--color-accent-hover: #6B93FF;
```
Every button, link, highlight, and glow across the whole site reads
from this one value — there's nothing else to update. Background,
text, and border colors work the same way; see the comments in that
file for what each variable controls.

**Before changing colors**, note that `text-tertiary` was specifically
tuned to pass WCAG accessibility contrast requirements (verified
during Phase 4) — if you adjust it, re-check contrast against both
`--color-bg-base` and `--color-bg-surface-1` stays above 4.5:1 for
normal text.

## 9. Changing fonts

Fonts are set in two places:
- **`app/layout.tsx`** — imports `GeistSans`/`GeistMono` from the
  `geist` package and applies them globally.
- **`tailwind.config.ts`** — the `fontFamily` section maps `font-sans`/`font-mono`
  to those.

To switch fonts entirely, you'd replace the `geist` import with
another font (e.g. via `next/font/google`) and update both files
accordingly — this is a real code change, not a content edit; happy to
do this for you if you have a specific font in mind.

## 10. Changing animations

Animation timing (how fast things move) is tokenized in
**`styles/tokens.css`**:
```css
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 450ms;
```
Custom animations (the hero's ambient drift, the headline ticker's
marquee scroll, the fade-up reveal) are defined as keyframes in
**`tailwind.config.ts`** under `keyframes`/`animation`. To slow down or
speed up the headline ticker, for example, change the `32s` in the
`marquee` animation definition there.

## 11. Connecting the newsletter

The signup form (`sections/NewsletterSection.tsx`) currently validates
input and shows a success message, but doesn't send anywhere real yet
— that's intentional (no backend was set up without your input on
which provider to use). To connect a real provider (ConvertKit,
Resend, Mailchimp, etc.):
1. Get an API key from your chosen provider.
2. In `sections/NewsletterSection.tsx`, find the `handleSubmit`
   function — there's a comment marking exactly where the placeholder
   `setTimeout` needs to become a real API call.
3. Store the API key as an environment variable (never hardcode it) —
   add it to `.env.local` locally and to Vercel's environment variable
   settings for production.

The contact form (`components/contact/ContactForm.tsx`) works the
same way and needs the same kind of connection.

## 12. Connecting YouTube, Instagram, LinkedIn, X, and email

All in one file: **`lib/config.ts`**:
```ts
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ZynthicTech_AI";
export const INSTAGRAM_URL = "https://www.instagram.com/zynthictech_07?igsh=YnpjYzRhem52cmt2";
export const LINKEDIN_URL = "https://linkedin.com/company/aiuniverse";
export const X_URL = "https://x.com/aiuniverse";
export const CONTACT_EMAIL = "storysphere173@gmail.com";
```
Replace each placeholder with your real profile URL. These currently
power:
- The footer's "follow us" icon row (`components/layout/FollowLinks.tsx`)
- The YouTube "Subscribe" buttons on the homepage and About page
- The floating Gmail button, footer Gmail link, and Contact page CTA
  (`components/contact/GmailButton.tsx`) — all open a `mailto:` link,
  no setup required.

Note: these are different from the **share buttons** on each article
(X/LinkedIn/Gmail/Copy in `components/article/ShareButtons.tsx`)
— those share the article being read, not link to your profiles. No
changes needed there; they're already fully functional.

## 13. Connecting analytics

Analytics is wired but inactive by default (loads nothing, tracks
nothing, until you turn it on):
1. Sign up for Plausible (or adapt
   `components/analytics/Analytics.tsx` for another privacy-friendly
   provider).
2. Set the environment variable `NEXT_PUBLIC_ANALYTICS_DOMAIN` to your
   domain (e.g. `aiuniverse.com`) — in `.env.local` for local testing,
   and in Vercel's Project Settings → Environment Variables for
   production.
3. That's it — no code change. The script only loads when that
   variable is set (see `.env.example` for the full list of variables
   this project uses).

## 14. Publishing updates and deploying

See `README.md` for the full step-by-step, and `EDITOR_GUIDE.md` §11
for the exact daily git workflow. In short: edit files locally, run
`npm run typecheck && npm run lint && npm run build` to verify nothing
broke, commit, `git push` — Vercel deploys automatically from there.

## 15. Which files are safe to edit

| Freely edit | Purpose |
|---|---|
| `content/topics/*.mdx` | Your articles |
| `public/images/topics/*` | Images/diagrams |
| `lib/videos.ts` | Video connections |
| `lib/config.ts` | Site name, contact email, social URLs |
| `lib/authors.ts` | Author bio |
| `styles/tokens.css` | Colors, spacing, shadows |
| `.env.local` (never commit this file) | Secrets/API keys |

## 16. Which files should never be hand-edited

| Don't edit directly | Why |
|---|---|
| `app/sitemap.ts`, `app/robots.ts`, `app/rss.xml/route.ts` | Auto-generated from your articles — editing them doesn't add content, it changes the generation logic itself |
| `app/topics/[slug]/opengraph-image.tsx`, `app/opengraph-image.tsx` | Auto-generate social preview images from article data |
| `lib/mdx.ts`, `lib/content.ts`, `lib/seo.ts` | Core architecture — the abstraction layer everything else depends on. Changes here affect every page at once. |
| `.next/` (folder) | Build output, regenerated every build — never edit, never commit |
| `node_modules/` | Installed packages — never edit |
| `package-lock.json` | Managed automatically by `npm install` |

If you want a change to any file in the second table, that's a real
code change worth asking for rather than editing directly — small
mistakes there can break every page at once rather than just one
article.

---

## Final quality checklist (verified this session)

- [x] TypeScript: `npm run typecheck` — clean
- [x] ESLint: `npm run lint` — clean
- [x] Production build: `npm run build` — all routes static
- [x] Every route verified live (200 status): homepage, `/topics`,
      `/videos`, `/about`, `/contact`, `/library`, article pages,
      sitemap, RSS, robots.txt
- [x] SEO: per-page metadata, JSON-LD, sitemap/RSS all confirmed
      working (Batch 1/Phase 5 verification, re-confirmed this batch)
- [x] Accessibility: contrast-verified tokens (Phase 4), semantic
      landmarks, keyboard navigation on search/palette
- [x] Search: verified against real content with actual scoring output
      (case-insensitivity, ranking, empty states)
- [x] Mobile: responsive breakpoints reviewed across Header, cards,
      forms, ticker
- [x] Share buttons: real share-intent URLs confirmed in rendered HTML
- [x] Videos: lazy-loaded facade confirmed, registry connection
      verified end-to-end
- [x] Homepage: ticker, hero, discovery quiz, continue exploring,
      featured/latest, YouTube, newsletter all confirmed rendering
- [x] Navigation: active-state indicators, mobile menu, command
      palette all confirmed present in rendered markup
- [x] Personalization: bookmark persistence, reading history, and the
      "Explore Your AI Journey" archetype logic all confirmed against
      real data, not just visual inspection

**Not verified in this environment (documented honestly, not
glossed over):** an actual Lighthouse run (no headless browser
available in this sandbox) and live browser console inspection. Both
were flagged the same way in earlier phases — recommend running
Lighthouse against your deployed URL once live.
