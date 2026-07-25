"use client";

import { useMemo } from "react";
import { ContentCard } from "@/components/content/ContentCard";
import { useBookmarks } from "@/lib/hooks/useBookmarks";
import { useReadingHistory } from "@/lib/hooks/useReadingHistory";
import type { TopicMeta } from "@/types/content";

interface LibraryContentProps {
  topics: TopicMeta[];
}

export function LibraryContent({ topics }: LibraryContentProps) {
  const { bookmarks } = useBookmarks();
  const { history, clearHistory } = useReadingHistory();

  const topicsBySlug = useMemo(() => new Map(topics.map((t) => [t.slug, t])), [topics]);

  const savedTopics = useMemo(
    () =>
      bookmarks
        .slice()
        .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
        .map((entry) => topicsBySlug.get(entry.slug))
        .filter((topic): topic is TopicMeta => topic !== undefined),
    [bookmarks, topicsBySlug]
  );

  const recentTopics = useMemo(
    () =>
      history
        .map((entry) => topicsBySlug.get(entry.slug))
        .filter((topic): topic is TopicMeta => topic !== undefined),
    [history, topicsBySlug]
  );

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="text-heading-3 font-semibold text-text-primary">
          Saved articles
        </h2>
        {savedTopics.length === 0 ? (
          <EmptyState message="Nothing saved yet — use the bookmark icon on any article or card to save it here." />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedTopics.map((topic) => (
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
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-heading-3 font-semibold text-text-primary">
            Recently viewed
          </h2>
          {recentTopics.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="text-body-sm text-text-tertiary transition-colors duration-fast hover:text-text-primary"
            >
              Clear history
            </button>
          )}
        </div>
        {recentTopics.length === 0 ? (
          <EmptyState message="Articles you read will show up here, so you can pick back up where you left off." />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentTopics.map((topic) => (
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
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-5 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle px-6 py-10 text-center">
      <p className="text-body-sm text-text-tertiary">{message}</p>
    </div>
  );
}
