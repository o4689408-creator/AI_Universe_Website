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
