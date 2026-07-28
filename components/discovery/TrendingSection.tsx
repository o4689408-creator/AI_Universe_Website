import { ContentCard } from "@/components/content/ContentCard";
import type { TopicMeta } from "@/types/content";

interface TrendingSectionProps {
  topics: TopicMeta[];
}

export function TrendingSection({ topics }: TrendingSectionProps) {
  if (topics.length === 0) return null;

  const trending = topics.filter((topic) => topic.trending);
  const shown = trending.length > 0 ? trending : topics.slice(0, 3);

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <span className="text-label uppercase text-accent">Trending AI</span>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((topic) => (
          <ContentCard
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            slug={topic.slug}
            title={topic.title}
            description={topic.subtitle}
            imageUrl={topic.heroImageUrl}
            category={topic.category}
            meta={`${topic.readTimeMinutes} min read`}
          />
        ))}
      </div>
    </div>
  );
}
