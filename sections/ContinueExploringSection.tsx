"use client";

import { useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { ContentCard } from "@/components/content/ContentCard";
import { useReadingHistory } from "@/lib/hooks/useReadingHistory";
import type { TopicMeta } from "@/types/content";

interface ContinueExploringSectionProps {
  topics: TopicMeta[];
}

/**
 * Renders nothing until the visitor has actually read something —
 * first-time visitors never see an awkward empty "Continue Exploring"
 * section. Reuses the same useReadingHistory hook that powers
 * /library, so there's exactly one source of truth for "recently
 * viewed" across the whole site.
 */
export function ContinueExploringSection({ topics }: ContinueExploringSectionProps) {
  const { history } = useReadingHistory();

  const recentTopics = useMemo(() => {
    const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));
    return history
      .slice(0, 3)
      .map((entry) => bySlug.get(entry.slug))
      .filter((topic): topic is TopicMeta => topic !== undefined);
  }, [history, topics]);

  if (recentTopics.length === 0) return null;

  return (
    <Section>
      <Container>
        <AnimatedReveal className="mb-6 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-label uppercase text-accent">Continue Exploring</span>
            <h2 className="text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
              Pick up where you left off.
            </h2>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {recentTopics.map((topic, index) => (
            <AnimatedReveal key={topic.slug} delayMs={index * 60}>
              <ContentCard
                href={`/topics/${topic.slug}`}
                slug={topic.slug}
                title={topic.title}
                description={topic.subtitle}
                imageUrl={topic.heroImageUrl}
                category={topic.category}
                meta={`${topic.readTimeMinutes} min read`}
              />
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
