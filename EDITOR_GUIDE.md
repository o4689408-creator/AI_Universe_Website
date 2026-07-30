# AI Universe — Editor's Guide

A beginner-friendly, step-by-step manual for managing this exact site
day-to-day: adding, editing, and deleting articles, connecting videos,
and publishing daily. Every path and command below is exact — copy and
use them as-is.

---

## 1. How do I add a new AI article manually?

Three steps, three files touched at most.

**Step 1 — add the hero image.**
Drop an image into:
```
public/images/topics/your-article-slug.svg
```
(PNG/JPG work too — just update the extension in the frontmatter below.)

**Step 2 — add the video to the registry** (skip if this article has no video yet).
Open `lib/videos.ts` and add an entry:
```ts
{
  id: "your-article-slug",
  slug: "your-article-slug",
  title: "Your Video Title",
  youtubeId: "dQw4w9WgXcQ",
  publishedAt: "2026-08-01",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  companionTopicSlug: "your-article-slug",
},
```

**Step 3 — create the article file.**
Create:
```
content/topics/your-article-slug.mdx
```
with this shape (copy an existing file as your starting point — e.g.
`content/topics/how-transformers-actually-work.mdx`):

```md
---
title: "Your Article Title"
subtitle: "One sentence describing what the reader will learn."
category: "AI Foundations"
tags: ["your", "tags"]
authorId: "founder"
publishedAt: "2026-08-01"
updatedAt: "2026-08-01"
readTimeMinutes: 12
heroImageUrl: "/images/topics/your-article-slug.svg"
companionVideoId: "your-article-slug"
sources:
  - label: "Source name"
    url: "https://example.com"
relatedSlugs: ["how-transformers-actually-work"]
---

Your opening paragraph.

## Your First Heading

Body text.
```

That's it. The next time you build/deploy, this article automatically
appears on the homepage, `/topics`, the sitemap, and the RSS feed —
**no other file needs to change.**

---

## 2. Where are the article files stored?

```
content/topics/
├── how-transformers-actually-work.mdx
├── inside-large-language-models.mdx
├── the-real-path-to-agi.mdx
└── your-article-slug.mdx   ← new articles go here
```

One `.mdx` file = one article. The filename (minus `.mdx`) becomes the
URL: `content/topics/my-article.mdx` → `yoursite.com/topics/my-article`.

---

## 3. How do I edit an existing article?

Open the file directly and edit it — there is no separate database or
admin panel; the `.mdx` file **is** the article.

```
content/topics/how-transformers-actually-work.mdx
```

If you change the meaning of the article (not just fixing a typo),
also bump the `updatedAt` date in the frontmatter:
```
updatedAt: "2026-08-15"
```
This updates the "Updated" label on the article page and the
`dateModified` field search engines see.

---

## 4. How do I delete an article?

1. Delete the file:
   ```
   rm content/topics/the-article-to-remove.mdx
   ```
2. Search the rest of your content for references to it and remove
   them:
   ```
   grep -rl "the-article-to-remove" content/topics/
   ```
   Remove its slug from any other article's `relatedSlugs` list.
3. If it had a companion video, remove its entry from `lib/videos.ts`
   too (optional — an orphaned video entry does no harm, but it's
   tidy to remove it).

The article immediately stops appearing everywhere (homepage,
`/topics`, sitemap, RSS) on the next build — nothing else to clean up.

**Note:** visiting the old URL directly will now correctly show your
custom 404 page (`app/not-found.tsx`). If the article was popular and
indexed by Google, consider adding a redirect instead of deleting
outright — ask me and I can wire up a redirect in `next.config.mjs`.

---

## 5. How do I add a new YouTube video and connect it to the correct article?

This is a two-part connection — both parts point at the same `id`:

**Part A — the video itself, in `lib/videos.ts`:**
```ts
{
  id: "my-new-article",              // <- must match Part B exactly
  slug: "my-new-article",
  title: "My New Article — The Video",
  youtubeId: "abcXYZ123",             // the real YouTube video ID from the URL
  publishedAt: "2026-08-10",
  thumbnailUrl: "https://i.ytimg.com/vi/abcXYZ123/hqdefault.jpg",
  companionTopicSlug: "my-new-article",
},
```

**Part B — the article's frontmatter, in `content/topics/my-new-article.mdx`:**
```
companionVideoId: "my-new-article"    // <- matches Part A's id
```

**Part C — where the video actually appears in the article body,**
inside the same `.mdx` file:
```
<VideoEmbed
  videoId="my-new-article"
  caption="Watch the full breakdown on the AI Universe YouTube channel."
/>
```

Once all three reference the same id, the real YouTube video shows up
in three places automatically: embedded in the article, in the
homepage's YouTube row, and in the article's `VideoObject` structured
data (for Google) — you never re-type the YouTube ID anywhere else.

---

## 6. How do I change the homepage to feature a specific article?

**Current behavior (exact code, in `app/page.tsx` and `lib/content.ts`):**
`getAllTopics()` sorts every article by `publishedAt`, newest first.
`FeaturedTopicSection` always takes the *first* article in that sorted
list as the big featured card. In plain terms:

> **The homepage automatically features your most recently published article. There's no separate "pin this" switch today.**

**Option A — no code change (recommended for daily publishing):**
Since it's always "whatever has the newest `publishedAt` date," simply
publishing a new article each day naturally rotates the featured spot
to it. If you want to re-feature an *older* article, edit its
`publishedAt` date forward:
```
publishedAt: "2026-08-20"   # move it to today's date
```
(Its position in `/topics` and the RSS feed will also move, since
everything sorts off this one field — that's an intentional trade-off
of this simple approach.)

**Option B — a small code change, if you want true manual pinning:**
If you'd like a dedicated on/off switch instead (e.g. `featured: true`
in frontmatter that overrides date order), that's a real but small
change to `types/content.ts`, `lib/mdx.ts`, and `lib/content.ts`
(a few lines each). I can build that for you if you'd like it —
just ask, and I'll treat it as a small follow-up task rather than
something to DIY, since it touches the content model.

---

## 7. If I publish one new article every day, will all previous articles remain permanently available?

**Yes.** Nothing in this architecture ever removes or archives old
content automatically. Every `.mdx` file in `content/topics/` stays
live, listed on `/topics`, included in the sitemap, and included in
the RSS feed — forever, until you manually delete the file (see
Question 4). Publishing article #200 does not affect the visibility of
article #1.

---

## 8. How are old articles organized and searched?

Today, exactly three organizing mechanisms exist, all already built:

1. **Chronological order** — `/topics` lists every article newest-first.
2. **Category** — the `category` frontmatter field (e.g. "AI
   Foundations", "Models", "Frontier AI") shows as a small label on
   every card, but there is **no category filter page yet** — it's
   currently a label, not a browsable filter.
3. **Tags** — the `tags` frontmatter field exists in the data model
   but similarly has **no UI to browse by tag yet**.
4. **Cmd/Ctrl+K search** — searches article titles and categories
   (substring match) across your *entire* article history, regardless
   of publish date.

**Honest limitation:** at 1 article/day, you'll have 365+ articles/year.
The current `/topics` page renders all of them in one ungrouped grid
with no pagination, and the Cmd+K search index is currently sent to
every page load in full. Both are fine at dozens of articles; both
will need attention (pagination, and/or a lighter search index) well
before you reach a few hundred. Flagging this now rather than after
it becomes a real problem — happy to build pagination or a proper
by-month archive whenever you're approaching that scale.

---

## 9. How can visitors search for articles from previous days, months, or years?

**Today: only via Cmd/Ctrl+K search (by title/category text), or by
scrolling the full `/topics` grid.** There is no date-based archive
page (e.g. "browse August 2026") built yet — that's a genuinely
missing feature for a daily-publishing site, not an oversight I'm
glossing over. If daily publishing is the real plan, I'd recommend
building a `/topics/archive` page grouped by month/year fairly soon —
it's a natural, contained addition to the existing `getAllTopics()`
data (just grouping the same sorted list by month), not a redesign.
Let me know if you'd like that built next.

---

## 10. Which files do I need to edit for each new article?

For a typical article with a video, exactly **three files**, none of
them shared with any other article:

| File | Purpose |
|---|---|
| `content/topics/your-slug.mdx` | The article itself (new file) |
| `lib/videos.ts` | One new entry appended (shared file, but you only ever *add* a line, never edit existing lines) |
| `public/images/topics/your-slug.svg` (or `.png`/`.jpg`) | The hero image (new file) |

Nothing else — not the homepage, not the sitemap, not the RSS feed,
not any component — ever needs to be touched for a new article.

---

## 11. Complete workflow: publishing one new article every day

Assuming your project is already connected to GitHub and deployed on
Vercel (per `README.md`):

```bash
# 1. Pull the latest version of your site
git pull

# 2. Add your hero image
#    (drag it into public/images/topics/your-slug.svg)

# 3. Add the video entry (if there's a companion video)
#    Edit lib/videos.ts, add one object to the array.

# 4. Write the article
#    Create content/topics/your-slug.mdx (see Question 1 for the template)

# 5. Verify everything locally before publishing
npm run typecheck
npm run lint
npm run build

# If all three succeed with no errors, you're good to publish.

# 6. Preview it locally (optional but recommended)
npm run start
# open http://localhost:3000/topics/your-slug

# 7. Commit and push
git add content/topics/your-slug.mdx lib/videos.ts public/images/topics/your-slug.svg
git commit -m "Add article: Your Article Title"
git push

# 8. Vercel automatically builds and deploys on push to your main branch.
#    Watch the deploy at vercel.com — it usually takes 1-2 minutes.

# 9. Verify it's live
#    Visit https://yoursite.com/topics/your-slug
```

That's the entire loop — no CMS login, no separate publishing step.
The `.mdx` file in your Git repository *is* the source of truth; Git
push *is* publish.

---

## 12. Quick reference — exact files for every task

| Task | Exact path |
|---|---|
| Add/edit/delete an article | `content/topics/*.mdx` |
| Add/edit a video connection | `lib/videos.ts` |
| Change author info | `lib/authors.ts` |
| Change site name, description, contact email, YouTube channel link | `lib/config.ts` |
| Change hero/diagram images | `public/images/topics/*` |
| Change design tokens (colors, spacing, fonts) | `styles/tokens.css` |
| Sitemap (auto-generated, don't edit) | `app/sitemap.ts` |
| RSS feed (auto-generated, don't edit) | `app/rss.xml/route.ts` |
| Homepage section order/composition | `app/page.tsx` |
