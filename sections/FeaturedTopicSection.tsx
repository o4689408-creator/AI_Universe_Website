import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { ContentCard } from "@/components/content/ContentCard";
import type { TopicMeta } from "@/types/content";

interface FeaturedTopicSectionProps {
  topics: TopicMeta[];
}

function formatReadTime(minutes: number) {
  return `${minutes} min read`;
}

/**
 * Purpose: the site's "hero product" — showcases 2-3 flawless deep
 * dives as curated authority rather than a large, thin content list.
 * Layout: one large featured card, then the remaining topics in a
 * row beneath. Animation: featured card reveals first, smaller cards
 * stagger in ~80ms apart.
 */
export function FeaturedTopicSection({ topics }: FeaturedTopicSectionProps) {
  if (topics.length === 0) return null;

  const [featured, ...rest] = topics;
  if (!featured) return null;

  return (
    <Section>
      <Container>
        <AnimatedReveal className="mb-6 flex flex-col gap-2">
          <span className="text-label uppercase text-accent">Featured</span>
          <h2 className="text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
            Start here
          </h2>
        </AnimatedReveal>

        <AnimatedReveal className="relative">
          <div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-xl bg-accent/[0.07] blur-3xl"
            aria-hidden="true"
          />
          <ContentCard
            featured
            href={`/topics/${featured.slug}`}
            slug={featured.slug}
            title={featured.title}
            description={featured.subtitle}
            imageUrl={featured.heroImageUrl}
            category={featured.category}
            meta={formatReadTime(featured.readTimeMinutes)}
          />
        </AnimatedReveal>

        {rest.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {rest.map((topic, index) => (
              <AnimatedReveal key={topic.slug} delayMs={(index + 1) * 80}>
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
        )}
      </Container>
    </Section>
  );
}
