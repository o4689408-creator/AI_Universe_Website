import type { ObjectId } from "mongodb";
import type { SourceLink } from "@/types/content";

export type ArticleStatus = "draft" | "ready" | "scheduled" | "published";

/**
 * The article document as stored in MongoDB's `articles` collection.
 * This is the CMS's source of truth for every article created through
 * the Admin dashboard — the four launch articles in /content/topics
 * remain plain .mdx files (see lib/mdx.ts) and are merged with these at
 * read time by lib/content.ts. Nothing here ever gets written back out
 * as an .mdx file; MongoDB is the only persistence layer for anything
 * created via the CMS.
 */
export interface ArticleDoc {
  _id: ObjectId;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  category: string;
  tags: string[];
  /** Raw markdown body, pasted or written by the admin. Rendered via lib/admin/render-markdown.ts (format:"md", not MDX/JSX) — see that file's doc comment for why. */
  content: string;
  heroImageUrl: string;
  /** Optional — a second image used for card/OG contexts distinct from the in-article hero. Falls back to heroImageUrl when unset. */
  featuredImageUrl?: string;
  /** Raw YouTube URL as pasted by the admin (any common URL shape). Parsed into a companion Video on read — see lib/admin/articles.ts#articleDocToTopicMeta. */
  youtubeUrl?: string;
  authorId: string;
  readTimeMinutes: number;
  /** ISO date string. Only meaningful once status is "published"; a draft's publishedAt is set the moment it's first published, not on creation. */
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  featured: boolean;
  trending: boolean;
  status: ArticleStatus;
  /** Only meaningful when status is "scheduled" — an ISO date string in the future. The article becomes publicly visible the moment this passes (checked lazily at read time; see lib/admin/articles.ts#isEffectivelyPublished). */
  scheduledFor?: string;
  sources: SourceLink[];
  relatedSlugs: string[];
  /** SEO/social overrides — every field here is optional and falls back to the equivalent editorial field (see lib/seo.ts#buildArticleMetadata) when unset, so filling these in is never required to publish. */
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
}

/** Payload accepted by lib/admin/articles.ts#createArticle / updateArticle — everything the Admin article form can submit. */
export interface ArticleInput {
  title: string;
  slug?: string;
  subtitle: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  heroImageUrl: string;
  featuredImageUrl?: string;
  youtubeUrl?: string;
  authorId?: string;
  readTimeMinutes?: number;
  featured?: boolean;
  trending?: boolean;
  scheduledFor?: string;
  sources?: SourceLink[];
  relatedSlugs?: string[];
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
}

/** Lightweight shape for the Admin articles table — avoids sending the full markdown body over the wire for a list view. */
export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  trending: boolean;
  scheduledFor?: string;
  publishedAt: string;
  updatedAt: string;
}

/** A managed category — see lib/admin/categories.ts. */
export interface CategoryDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  createdAt: string;
}

/** A managed tag — see lib/admin/tags.ts. */
export interface TagDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  createdAt: string;
}

/** A reusable media library entry — see lib/admin/media.ts. */
export interface MediaDoc {
  _id: ObjectId;
  url: string;
  altText: string;
  caption?: string;
  createdAt: string;
}

export interface ArticleListFilters {
  query?: string;
  status?: ArticleStatus;
  category?: string;
  tag?: string;
  featured?: boolean;
  trending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ArticleListResult {
  items: ArticleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
