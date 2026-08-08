import { ContentCard } from "@/components/content/ContentCard";
import { getVideoById } from "@/lib/videos";
import type { RecommendationResult } from "@/lib/recommendations";

interface RecommendationResultsProps {
  results: RecommendationResult[];
  hasSelection: boolean;
}

export function RecommendationResults({ results, hasSelection }: RecommendationResultsProps) {
  if (!hasSelection) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle px-6 py-12 text-center">
        <p className="text-body-sm font-medium text-text-primary">
          Select a few interests above to see your recommendations.
        </p>
        <p className="text-body-sm text-text-tertiary">
          We&apos;ll match them against our articles and videos instantly.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle px-6 py-12 text-center">
        <p className="text-body-sm font-medium text-text-primary">
          Nothing matches those interests yet.
        </p>
        <p className="text-body-sm text-text-tertiary">
          We&apos;re publishing new deep-dives regularly — try another
          interest, or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {results.map(({ topic, matchedInterests }) => {
        const video =
          topic.companionVideo ?? (topic.companionVideoId ? getVideoById(topic.companionVideoId) : undefined);
        return (
          <div key={topic.slug} className="flex flex-col gap-2">
            <ContentCard
              href={`/topics/${topic.slug}`}
              slug={topic.slug}
              title={topic.title}
              description={topic.subtitle}
              imageUrl={topic.heroImageUrl}
              category={topic.category}
              meta={`${topic.readTimeMinutes} min read`}
            />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-body-sm text-text-tertiary">
              <span>Matched: {matchedInterests.join(", ")}</span>
              {video && (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={`/topics/${topic.slug}`}
                    className="text-accent hover:underline"
                  >
                    Watch the video
                  </a>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
