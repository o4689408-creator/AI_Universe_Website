import { ContentCard } from "@/components/content/ContentCard";
import type { TopicMeta } from "@/types/content";

interface RelatedTopicsProps {
  topics: TopicMeta[];
}

export function RelatedTopics({ topics }: RelatedTopicsProps) {
  if (topics.length === 0) return null;

  return (
    <div className="mt-9">
      <h2 className="text-heading-3 font-semibold text-text-primary">
        Continue exploring
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {topics.map((topic) => (
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
