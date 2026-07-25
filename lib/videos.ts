import type { Video } from "@/types/content";

/**
 * Canonical video registry.
 *
 * This is the one place YouTube video data lives. Article MDX files
 * reference a video by `id` (via the <VideoEmbed videoId="..." /> tag —
 * see components/article/mdx-components.tsx), and the homepage's
 * YouTube section pulls from the same list — so a video's real
 * youtubeId, title, and thumbnail only ever need updating in one place.
 *
 * TODO before launch: replace youtubeId and thumbnailUrl below with the
 * real YouTube video ID and a real thumbnail (or switch thumbnailUrl to
 * `https://i.ytimg.com/vi/{youtubeId}/hqdefault.jpg` once real IDs are
 * in place — i.ytimg.com is already allow-listed in next.config.mjs).
 * See CONTENT_GUIDE.md for the full walkthrough.
 */
export const videos: Video[] = [
  {
    id: "how-transformers-actually-work",
    slug: "how-transformers-actually-work",
    title: "How Transformers Actually Work",
    youtubeId: "REPLACE_WITH_REAL_YOUTUBE_ID_1",
    publishedAt: "2026-06-02",
    thumbnailUrl: "/images/videos/video-1.svg",
    companionTopicSlug: "how-transformers-actually-work",
  },
  {
    id: "inside-large-language-models",
    slug: "inside-large-language-models",
    title: "Inside Large Language Models",
    youtubeId: "REPLACE_WITH_REAL_YOUTUBE_ID_2",
    publishedAt: "2026-06-18",
    thumbnailUrl: "/images/videos/video-2.svg",
    companionTopicSlug: "inside-large-language-models",
  },
  {
    id: "the-real-path-to-agi",
    slug: "the-real-path-to-agi",
    title: "The Real Path to AGI",
    youtubeId: "REPLACE_WITH_REAL_YOUTUBE_ID_3",
    publishedAt: "2026-07-05",
    thumbnailUrl: "/images/videos/video-3.svg",
    companionTopicSlug: "the-real-path-to-agi",
  },
];

export function getVideoById(id: string): Video | undefined {
  return videos.find((video) => video.id === id);
}
