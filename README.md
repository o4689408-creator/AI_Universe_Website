# AI Universe

A premium AI knowledge platform — deep research articles paired with
companion YouTube videos, built with Next.js (App Router), TypeScript,
Tailwind CSS, and MDX.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` if you want to set a custom site
URL or enable analytics locally — both are optional; sensible defaults
are used otherwise.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no output emitted |

## Project structure

```
app/            Routes (App Router) — pages, layouts, loading/error states
components/     Reusable UI: ui/, layout/, content/, article/, contact/, analytics/
sections/       Composed, page-specific sections (homepage sections)
content/topics/ Article content as MDX files
lib/            Content abstraction, SEO helpers, config, utilities
styles/         Design tokens (CSS variables) — the single source of truth for colors, spacing, etc.
types/          Shared TypeScript types (Topic, Video, Author, ...)
public/         Static assets (images, icons)
```

See `CONTENT_GUIDE.md` for how to add a new article and connect it to
a YouTube video, and `PRODUCTION_CHECKLIST.md` before your first
deploy.

## Deploying to Vercel

This is a standard Next.js App Router project — no special
configuration is required beyond environment variables.

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, click **Add New Project** and import the repository.
   Vercel auto-detects Next.js; the default build command
   (`next build`) and output are already correct.
3. Under **Environment Variables**, set:
   - `NEXT_PUBLIC_SITE_URL` — your production domain, e.g.
     `https://aiuniverse.com` (falls back to that same value if unset,
     but set it explicitly once you have a domain).
   - `NEXT_PUBLIC_ANALYTICS_DOMAIN` — optional, only if using Plausible.
4. Deploy. Every push to your main branch redeploys automatically;
   every pull request gets its own preview URL.
5. Add your custom domain under **Project Settings → Domains**.

No database, no serverless function configuration, and no build
plugins are required for the current feature set.

## Design system

All colors, typography, spacing, radii, shadows, and motion timing are
defined once in `styles/tokens.css` as CSS variables, and mapped into
Tailwind's theme in `tailwind.config.ts`. Change a value there, not in
individual components.
