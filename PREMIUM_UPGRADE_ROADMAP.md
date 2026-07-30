# AI Universe — Premium Experience Upgrade: Roadmap & Plan

## Read this first: reconciling the vision with what's already been decided

Before the roadmap, one honest calibration, because a few items in the
brief pull in a different direction from decisions we've already made
together — worth naming rather than quietly overriding.

The approved design system's explicit rule was: *"Avoid: cheap blog
designs, overuse of gradients, neon cyberpunk style, cluttered
layouts."* Restraint — one accent color at ~5% visual weight, motion
that's "purposeful only" — was the whole premise, and it's exactly
what makes this look like Linear or Stripe rather than a typical "AI
startup" site. Several asks in this brief (3D depth, floating
particles, glass effects, parallax) are the same category of effect
that, done a little too enthusiastically, is what tips a site *into*
the gimmicky-AI-startup look the original brief told me to avoid.

My plan below says yes to all of it, but interprets "3D depth" and
"floating particles" as **CSS/SVG-only, extremely subtle atmosphere**
(the same philosophy as the hero's existing ambient gradient blobs —
just more refined), not literal WebGL 3D scenes. That keeps every
performance and dependency rule in this same brief intact. If you
specifically want real 3D (rotating geometry, depth-of-field,
mouse-tracked 3D objects), that requires a real library
(`three.js`/`react-three-fiber`) and a meaningfully heavier JS payload
— I'd want your explicit sign-off on that trade-off before adding it,
since it directly contradicts "avoid heavy 3D libraries unless truly
necessary" in this same message. My recommendation: **don't** — the
CSS-only version reads as more premium anyway, not less.

---

## 1. New Premium Feature Roadmap

Grouped by what's actually buildable now vs. what genuinely needs new
content or a scope decision from you first.

### Group A — Visual & motion upgrade (buildable immediately, zero new content needed)
- Refined hero: layered CSS gradient depth, mouse-parallax on the
  ambient blobs, subtle grain texture
- Upgraded card system: soft tilt-on-hover, refined glow/shadow,
  glass-effect surfaces used only where they earn their keep (nav bar,
  modal overlays — already partially in place)
- Typography refinement: slightly more editorial rhythm, refined pull-quote
  treatment
- Smooth, consistent page-transition and reveal-motion pass across
  every existing page

### Group B — Personalization & engagement (buildable immediately — reuses your existing article/video metadata, no new content required)
- **"Explore Your AI Journey"** interest picker → recommends existing
  articles/videos by matching your existing `category`/`tags` fields
  against selected interests (the data to power this already exists
  in every article's frontmatter)
- **Bookmarks / saved articles** — client-side (browser storage),
  no login required
- **"Continue exploring"** — based on articles you've actually
  visited, stored client-side
- **Trending topics** — needs one small decision from you: either (a)
  editorially curated (you flag 1-2 articles as "trending" in
  frontmatter), or (b) genuinely data-driven off analytics once
  analytics is turned on. (a) is buildable today; (b) needs the
  analytics provider actually connected first.

### Group C — Interactive knowledge tools (need real content decisions before I build them)
- **AI Timeline Explorer** — I can draft a factual starter set of
  major AI milestones, but this needs *your* review before publishing
  — a timeline is a factual-accuracy surface, not a design surface.
- **AI Impact Calculator** — lightweight version buildable now (maps
  your existing article categories to professions); a genuinely deep
  version needs profession-specific content you'd want to write.
- **AI Quiz** — needs real question content. I can draft a starter
  set for your review; recommend keeping the first version small
  (5-10 questions) rather than a large content investment up front.
- **AI Comparison Tool** — the highest-maintenance item on this whole
  list. AI model/tool capabilities change monthly; a broad comparison
  table goes stale fast and becomes a credibility risk if unmaintained.
  Recommend scoping this down hard: 3-4 well-sourced comparisons,
  clearly dated, rather than an ambitious database.

### Group D — Recommend deferring or scoping down
- **True 3D / WebGL particle systems** — see calibration note above.
  Recommend the CSS-only version instead; revisit only if you
  specifically want to spend the dependency/performance budget on it.
- **User accounts / cross-device saved collections** — needs real
  backend infrastructure (auth + database), which is a different kind
  of project than "reuse existing architecture." The client-side
  bookmarking in Group B gets you 90% of the user value with 0% of
  the backend investment — recommend starting there and only building
  real accounts if bookmarking usage actually demonstrates demand for it.

---

## 2. UI Improvement Plan

| Area | Current state | Upgrade |
|---|---|---|
| Hero | Static gradient blobs, fade-up text | Add CSS mouse-parallax (blobs shift subtly with cursor), finer gradient layering, refined scroll cue |
| Cards | Flat lift-on-hover | Add subtle perspective tilt (CSS `transform: perspective()`, no JS 3D), refined border glow, smoother image scale |
| Typography | Solid, functional | Tighten display-type tracking further at the largest sizes; more deliberate pull-quote/callout rhythm |
| Glass effects | Header only (`backdrop-blur`) | Extend tastefully to the command palette and modal surfaces only — not a site-wide effect |
| Shadows/glow | Token exists, used narrowly | Use the existing `shadow-glow-accent` token more purposefully on the single most important element per screen (already the design rule — just apply it more confidently) |
| Icons | Inline SVG, minimal set | Expand the existing hand-rolled icon approach for the new tool sections — stay off an icon library given the "no unnecessary dependencies" rule |
| Motion | Scroll-reveal + page fade | Add the parallax + tilt above; keep every duration in the existing 150-450ms token range — nothing new gets slower or bouncier |

---

## 3. Build Order — What Ships First

Ordered by impact-to-risk ratio, not by how exciting each item sounds:

1. **Group A (visual/motion polish)** — biggest immediate perceptual
   upgrade, touches only existing components/tokens, zero new content,
   lowest risk.
2. **"Explore Your AI Journey" + personalized recommendations (Group B)**
   — the single highest-engagement feature on this whole list, and it's
   fully buildable today from data you already have.
3. **Bookmarks + "Continue exploring" (Group B)** — cheap to build,
   directly increases return visits.
4. **AI Impact Calculator, lightweight version (Group C)** — reuses
   existing category data, contained scope.
5. **AI Timeline Explorer (Group C)** — after you've reviewed a draft
   dataset I provide.
6. **AI Quiz (Group C)** — after you've reviewed a draft question set.
7. **AI Comparison Tool, scoped down (Group C)** — last, and
   deliberately small, given its maintenance burden.

I'd suggest we do these as separate, reviewable phases (same pattern
as the last five phases) rather than one giant drop — easier to keep
quality high and catch issues early, same as before.

---

## 4. Expected Impact on Engagement

Being honest that without analytics connected yet, these are
directional expectations based on how each mechanism works, not
measured predictions:

| Feature | Primary engagement lever |
|---|---|
| Visual/motion polish | First-impression trust → lower bounce rate |
| Interest picker + recommendations | Relevance → longer session, more pages/session |
| Bookmarks / Continue exploring | Return-visit rate |
| Timeline / Impact Calculator / Quiz | Session depth, shareability (novel, screenshot-able moments) |
| Comparison tool | Search-intent traffic capture (people actively comparing tools search for exactly this) |

Turning on the analytics placeholder we built in Phase 4
(`NEXT_PUBLIC_ANALYTICS_DOMAIN`) before shipping these would let us
actually measure which of these move the needle, rather than guessing
after the fact.

---

## What I need from you to proceed

- Confirmation of the build order above (or reprioritize it)
- A decision on Trending Topics: editorial flag vs. analytics-driven
- Green light for me to draft the Timeline dataset and Quiz questions
  for your review (I'll clearly mark them as drafts needing fact-check)
- Confirmation that CSS-only "3D depth" is the right call vs. a real
  3D library

Once confirmed, I'll start with Group A and Group B — no code until
you give the word.
