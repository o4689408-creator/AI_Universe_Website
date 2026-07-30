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
  sources: SourceLink[];
  relatedSlugs: string[];
  /**
   * Plain-text extraction of the article body (MDX/markdown syntax
   * stripped), used only by lib/search.tsx to match search queries
   * against the actual content of the piece — never rendered directly.
   */
  contentText: string;
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
