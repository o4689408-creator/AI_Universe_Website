import type { Topic, TopicMeta, Video } from "@/types/content";
import { listTopicSlugs, readTopic, readTopicMeta } from "@/lib/mdx";
import {
  getPublishedArticlesAsTopicMetas,
  getPublishedArticleBySlugAsTopic,
} from "@/lib/admin/articles";
import { videos as videoRegistry } from "@/lib/videos";

/**
 * Content abstraction layer.
 *
 * Every page/component fetches content through these functions — never
 * by reading MDX files or a database directly. Content now comes from
 * two sources, merged transparently here: the hand-authored .mdx files
 * in /content/topics (lib/mdx.ts — the four launch articles, and any
 * future ones someone chooses to add by hand) and articles created
 * through the Admin CMS, stored in MongoDB (lib/admin/articles.ts).
 * Every caller — every page/component — keeps using these same
 * function signatures regardless of which source a given article
 * actually came from.
 */

export async function getAllTopics(): Promise<TopicMeta[]> {
  const slugs = listTopicSlugs();
  const [mdxTopics, cmsTopics] = await Promise.all([
    Promise.all(slugs.map(readTopicMeta)),
    getPublishedArticlesAsTopicMetas(),
  ]);

  return [...mdxTopics.filter((topic): topic is TopicMeta => topic !== null), ...cmsTopics].sort(
    (a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)
  );
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const mdxTopic = await readTopic(slug);
  if (mdxTopic) return mdxTopic;
  return getPublishedArticleBySlugAsTopic(slug);
}

/**
 * Prefers articles explicitly marked "Featured" (either MDX frontmatter
 * or the Admin CMS's Featured toggle), most-recent first, then fills
 * any remaining slots with the most recent non-featured articles — so
 * this always returns `limit` articles as long as that many exist,
 * exactly like the original recency-only behavior did before the
 * Featured flag existed.
 */
export async function getFeaturedTopics(limit = 3): Promise<TopicMeta[]> {
  const topics = await getAllTopics();
  const featured = topics.filter((topic) => topic.featured);
  const rest = topics.filter((topic) => !topic.featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getTopicsBySlugs(slugs: string[]): Promise<TopicMeta[]> {
  const all = await getAllTopics();
  const bySlug = new Map(all.map((topic) => [topic.slug, topic]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((topic): topic is TopicMeta => topic !== undefined);
}

/**
 * Returns the topic immediately before and after the given slug, in
 * publish-date order, for the article page's Previous/Next navigation.
 */
export async function getAdjacentTopics(
  slug: string
): Promise<{ previous: TopicMeta | null; next: TopicMeta | null }> {
  const all = await getAllTopics();
  const index = all.findIndex((topic) => topic.slug === slug);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: index < all.length - 1 ? all[index + 1]! : null,
    next: index > 0 ? all[index - 1]! : null,
  };
}

// Video data lives in lib/videos.ts (the canonical registry) — the
// YouTube Data API integration (blueprint §8) replaces this function's
// internals in a later phase without changing its signature or callers.
export async function getAllVideos(): Promise<Video[]> {
  return videoRegistry;
}

export async function getLatestVideos(limit = 3): Promise<Video[]> {
  const videos = await getAllVideos();
  return videos
    .slice()
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit);
}
