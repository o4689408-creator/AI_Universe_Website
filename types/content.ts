import type { ReactNode } from "react";

/**
 * Content schemas for AI Universe.
 *
 * These types are the contract between content (MDX files today, a
 * headless CMS/database later — see lib/content.ts) and the UI
 * components that render it. Only `Topic` and `Video` are populated
 * in v1, but `Author` and the shared `SourceLink` shape are designed
 * to be reused by every future content type (News, Tool, Model,
 * Company) so the data model doesn't need to be reworked later.
 */

export interface Author {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  bio?: string;
}

export interface SourceLink {
  label: string;
  url: string;
}

/**
 * One image in an article's gallery (up to 15 — see
 * components/admin/editor/ImageListField.tsx), distinct from
 * `heroImageUrl`/`featuredImageUrl` on TopicMeta below, which are
 * single-purpose (the top-of-article hero and the card/OG thumbnail).
 * This is for additional images used *within* the article body/gallery.
 * `id` is a stable client-generated key (crypto.randomUUID()) used for
 * React list identity and drag-reorder — never shown to readers.
 */
export interface ArticleImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

/**
 * One answer choice inside a quiz question. `text` is plain text (not
 * `ReactNode`) because this shape has to survive a MongoDB round-trip
 * and a plain-JSON <input type="hidden"> in the Admin form — see
 * QuizSeries.tsx, which maps `text` onto the same internal `label`
 * field its MDX-authored `<QuizOption>` children already use, so both
 * sources render through identical code.
 */
export interface QuizOptionData {
  text: string;
  imageUrl?: string;
  imageAlt?: string;
}

/**
 * One quiz question, in the JSON-safe shape used by CMS-authored
 * articles (components/admin/editor/QuizEditorField.tsx writes this;
 * QuizSeries.tsx renders it). MDX-authored articles keep writing
 * `<QuizQuestion correctIndex="1">` inline in the article body instead —
 * see the long comment on Quiz.tsx for why that's a quoted string there
 * — but resolve to this same shape internally, so there is exactly one
 * quiz-taking implementation regardless of which one authored it.
 * `correctIndex` is a real number here (from MongoDB, never serialized
 * through an MDX/JSX prop), but QuizSeries still range-checks it against
 * `options.length` before trusting it — see its doc comment.
 */
export interface QuizQuestionData {
  question: string;
  correctIndex: number;
  correctExplanation: string;
  incorrectExplanation: string;
  questionImageUrl?: string;
  questionImageAlt?: string;
  explanationImageUrl?: string;
  explanationImageAlt?: string;
  options: QuizOptionData[];
}

export interface Video {
  id: string;
  slug: string;
  title: string;
  youtubeId: string;
  publishedAt: string;
  thumbnailUrl: string;
  /** Slug of the companion Topic article this video is paired with, if any. */
  companionTopicSlug?: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Metadata-only shape — everything needed to render a card, a listing
 * grid, or Previous/Next navigation, but without the (comparatively
 * expensive) compiled article body. `getAllTopics()` returns this.
 */
export interface TopicMeta {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  heroImageUrl: string;
  companionVideoId?: string;
  /** Editorial flag for the homepage/Topics "Trending" section — set manually in frontmatter until real analytics is connected. */
  trending?: boolean;
  /** Editorial flag for the homepage "Featured" spot — set manually (MDX frontmatter today, the Admin CMS's Featured toggle for CMS articles). `getFeaturedTopics()` in lib/content.ts prefers these before falling back to recency. */
  featured?: boolean;
  sources: SourceLink[];
  relatedSlugs: string[];
  /**
   * Additional gallery images (0–15), Admin-CMS-only for now — MDX
   * articles can already embed as many images as their author wants
   * directly in the body, so this is left `undefined` for them rather
   * than defaulted, and every consumer treats `topic.images` as
   * optional. See components/article/ArticleImageGallery.tsx.
   */
  images?: ArticleImage[];
  /**
   * Structured quiz data, Admin-CMS-only — MDX articles keep authoring
   * their quiz inline in the body via `<QuizQuestion>` (compiled as part
   * of `content` below) instead, so this stays `undefined` for them.
   * app/topics/[slug]/page.tsx only renders `<QuizSeries questions={...}>`
   * when this is present and non-empty, so an MDX article's page never
   * gets a second, duplicate quiz section.
   */
  quiz?: QuizQuestionData[];
  /**
   * Plain-text extraction of the article body (MDX/markdown syntax
   * stripped), used only by lib/search.tsx to match search queries
   * against the actual content of the piece — never rendered directly.
   */
  contentText: string;
  /**
   * A fully-resolved companion video, set only for CMS-authored
   * articles (lib/admin/articles.ts builds this directly from the
   * article's pasted YouTube URL). When present, callers should prefer
   * this over resolving `companionVideoId` through the static
   * lib/videos.ts registry — see app/topics/[slug]/page.tsx and
   * components/discovery/RecommendationResults.tsx for the fallback
   * pattern (`topic.companionVideo ?? (topic.companionVideoId ? getVideoById(...) : undefined)`).
   * MDX-authored articles never set this and keep using the registry
   * exactly as before.
   */
  companionVideo?: Video;
  /** Which system authored this piece — lets the Admin CMS list only editable (CMS-sourced) articles and lets lib/content.ts merge both sources. Never rendered to visitors. */
  source: "mdx" | "cms";
  /**
   * Optional SEO/social overrides, set only by the Admin CMS's SEO
   * panel — MDX articles never set these and lib/seo.ts#buildArticleMetadata
   * falls back to the equivalent editorial field (title/subtitle/
   * heroImageUrl/canonical topic URL) for every one of them, so this
   * is purely additive and changes nothing for existing articles.
   */
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
}

/**
 * Full article shape — metadata plus the compiled MDX body and its
 * extracted table of contents. Only fetched for the single article
 * page being rendered, via `getTopicBySlug()`.
 */
export interface Topic extends TopicMeta {
  content: ReactNode;
  headings: TocHeading[];
}
