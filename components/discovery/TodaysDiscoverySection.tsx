import { ContentCard } from "@/components/content/ContentCard";
import type { TopicMeta } from "@/types/content";

interface TodaysDiscoverySectionProps {
  topics: TopicMeta[];
}

/**
 * Deterministic, not random: the same day always picks the same
 * article for every visitor (no per-request randomness, no storage) —
 * computed purely from today's day-of-year modulo the topic count, so
 * this rotates on its own as a static/ISR page without any backend.
 */
function pickTodaysTopic(topics: TopicMeta[]): TopicMeta {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  const index = dayOfYear % topics.length;
  return topics[index]!;
}

export function TodaysDiscoverySection({ topics }: TodaysDiscoverySectionProps) {
  if (topics.length === 0) return null;

  const topic = pickTodaysTopic(topics);

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <span className="text-label uppercase text-accent">Today&apos;s AI Discovery</span>
      </div>
      <ContentCard
        featured
        href={`/topics/${topic.slug}`}
        slug={topic.slug}
        title={topic.title}
        description={topic.subtitle}
        imageUrl={topic.heroImageUrl}
        category={topic.category}
        meta={`${topic.readTimeMinutes} min read`}
      />
    </div>
  );
}
