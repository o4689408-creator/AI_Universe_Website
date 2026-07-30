import type { Topic, TopicMeta, Video } from "@/types/content";
import { listTopicSlugs, readTopic, readTopicMeta } from "@/lib/mdx";
import { videos as videoRegistry } from "@/lib/videos";

/**
 * Content abstraction layer.
 *
 * Every page/component fetches content through these functions — never
 * by reading MDX files or a database directly. Today they read from
 * `/content/topics` (see lib/mdx.ts); when the site migrates to a
 * headless CMS (blueprint Phase 2+), only lib/mdx.ts (or its
 * replacement) changes — these function signatures stay the same.
 */

export async function getAllTopics(): Promise<TopicMeta[]> {
  const slugs = listTopicSlugs();
  const topics = await Promise.all(slugs.map(readTopicMeta));
  return topics
    .filter((topic): topic is TopicMeta => topic !== null)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  return readTopic(slug);
}

export async function getFeaturedTopics(limit = 3): Promise<TopicMeta[]> {
  const topics = await getAllTopics();
  return topics.slice(0, limit);
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
