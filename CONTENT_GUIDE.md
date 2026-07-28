# Content Guide

How to add a real article and connect it to its YouTube video.

## 1. Add the video to the registry

Open `lib/videos.ts` and either edit one of the three existing entries or
add a new one:

```ts
{
  id: "your-article-slug",              // must match the article's frontmatter companionVideoId
  slug: "your-article-slug",
  title: "Your Video Title",
  youtubeId: "dQw4w9WgXcQ",              // the real YouTube video ID (from the video URL)
  publishedAt: "2026-08-01",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  companionTopicSlug: "your-article-slug",
}
```

`i.ytimg.com` is already allow-listed in `next.config.mjs`, so real
YouTube thumbnail URLs work immediately — no need to download/host
thumbnails yourself.

## 2. Write the article

Add a new file to `content/topics/your-article-slug.mdx`. Copy the
frontmatter shape from any existing article:

```md
---
title: "Your Article Title"
subtitle: "One sentence describing what the reader will learn."
category: "AI Foundations"        # or Models, Frontier AI, etc.
tags: ["your", "tags", "here"]
authorId: "founder"                # see lib/authors.ts
publishedAt: "2026-08-01"
updatedAt: "2026-08-01"
readTimeMinutes: 12
heroImageUrl: "/images/topics/your-image.svg"
companionVideoId: "your-article-slug"   # must match the id in lib/videos.ts
sources:
  - label: "Source name"
    url: "https://example.com"
relatedSlugs: ["another-existing-slug"]
---

Opening paragraph — no heading needed, this is the hook.

## Your First Section

Body text here.

<Callout title="Go deeper: some technical detail">
Optional expandable technical depth.
</Callout>

<PullQuote>
An editorial pull-quote for emphasis.
</PullQuote>

<Figure
  src="/images/topics/your-image.svg"
  alt="Description of the diagram"
  caption="Caption shown below the image."
/>

<VideoEmbed
  videoId="your-article-slug"
  caption="Watch the full breakdown on the AI Universe YouTube channel."
/>

## Key takeaways

- Bullet summary point.
```

That's it — the article automatically appears on the homepage, `/topics`
hub, sitemap, and RSS feed on the next build. No other file needs to
change.

## 3. Hero and diagram images

Replace the placeholder abstract SVGs in `public/images/topics/` with
your own diagrams (SVG, PNG, or JPG all work with `next/image`). Keep
the same aspect ratio (roughly 16:9 to 16:10) for consistent card
layout.

## 4. Full MDX formatting reference (Batch 1)

Everything below is available in any article's `.mdx` file, in addition
to the Callout/PullQuote/Figure/VideoEmbed shown above.

**Headings:** `#` through `######` (h1–h6) all work and automatically
get deep-linkable ids. Only `##`/`###` appear in the sticky table of
contents by design — deeper headings still get an id, just aren't
listed in the TOC.

**Basic formatting:** `**bold**`, `*italic*`, `~~strikethrough~~`,
`` `inline code` ``, and `[links](url)` all work as standard Markdown.

**Underline and highlighted text** need dedicated components (plain
`<u>`/`<mark>` HTML tags do **not** reliably style when mixed inline
with text — this is a real MDX/remark parsing behavior, verified, not
a limitation of this project specifically):
```
<Underline>underlined text</Underline>
<Highlight>highlighted text</Highlight>
```

**Colored text**, limited to the four design-system tones (never
arbitrary hex, to keep articles visually consistent):
```
<ColorText color="accent">emphasized phrase</ColorText>
```
`color` can be `accent`, `success`, `warning`, or `error`.

**Callout boxes** — five variants:
```
<Callout>Collapsed by default — for optional technical depth.</Callout>
<Note>Always-visible note.</Note>
<Tip>Always-visible tip.</Tip>
<Warning>Always-visible warning.</Warning>
<Info>Always-visible info box.</Info>
```
Add a custom title with `<Tip title="Custom title">...</Tip>`.

**Tables** — standard Markdown table syntax works (GitHub-flavored):
```
| Model | Released |
|---|---|
| GPT-4 | 2023 |
```

**Code blocks** — fenced code with a language tag gets a language
label, a working copy button, and lightweight syntax highlighting:
````
```ts
const x = 1;
```
````
This is a small, dependency-free highlighter covering common
keywords/strings/comments/numbers — not a full per-language grammar
like Shiki. Good enough for premium-looking code, not meant to be
pixel-perfect for every language.

**Citations** — link a claim to a numbered entry in Sources:
```
This is a claim<Cite index="1" />.
```
`index` must be a **string** (`index="1"`, not `index={1}`) — MDX
silently drops numeric expression props on inline components used
mid-paragraph. This was caught and verified during Batch 1 testing;
`index="1"` is the reliable, supported syntax. The number must match
the position (1-indexed) of the source in that article's frontmatter
`sources` list.

**Horizontal rule:** `---` on its own line.

**Blockquote vs. pull quote** — a plain `> quote` renders as a normal
quotation; use `<PullQuote>` (as before) for the larger, editorial
emphasis style.

## 5. A note on the current placeholder content

The three articles shipped with this project (`how-transformers-actually-work`,
`inside-large-language-models`, `the-real-path-to-agi`) are real,
accurate explanations — not lorem ipsum — but their companion video IDs
in `lib/videos.ts` are placeholders (`REPLACE_WITH_REAL_YOUTUBE_ID_*`).
Swap those three values for your actual YouTube video IDs and the
connection (embed, JSON-LD structured data, homepage video row) is live
immediately — nothing else to change.
