import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { ContentCard } from "@/components/content/ContentCard";
import type { TopicMeta } from "@/types/content";

interface LatestContentSectionProps {
  topics: TopicMeta[];
}

function formatReadTime(minutes: number) {
  return `${minutes} min read`;
}

export function LatestContentSection({ topics }: LatestContentSectionProps) {
  if (topics.length === 0) return null;

  return (
    <Section background="surface-1" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full blur-[130px]"
        style={{ background: "hsla(265, 70%, 65%, 0.06)" }}
        aria-hidden="true"
      />
      <Container>
        <AnimatedReveal className="mb-6 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-label uppercase text-accent">Latest</span>
            <h2 className="text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
              Latest from AI Universe
            </h2>
          </div>
          <Link
            href="/topics"
            className="hidden shrink-0 text-body-sm text-text-secondary transition-colors duration-fast hover:text-text-primary sm:block"
          >
            View all topics →
          </Link>
        </AnimatedReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {topics.map((topic, index) => (
            <AnimatedReveal key={topic.slug} delayMs={index * 60}>
              <ContentCard
                href={`/topics/${topic.slug}`}
                slug={topic.slug}
                title={topic.title}
                description={topic.subtitle}
                imageUrl={topic.heroImageUrl}
                category={topic.category}
                meta={formatReadTime(topic.readTimeMinutes)}
              />
            </AnimatedReveal>
          ))}
        </div>

        <Link
          href="/topics"
          className="mt-6 block text-body-sm text-text-secondary transition-colors duration-fast hover:text-text-primary sm:hidden"
        >
          View all topics →
        </Link>
      </Container>
    </Section>
  );
}
