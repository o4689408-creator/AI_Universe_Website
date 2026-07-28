import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContentCard } from "@/components/content/ContentCard";
import { SearchBox } from "@/components/ui/SearchBox";
import { PageAmbientBackground } from "@/components/ui/PageAmbientBackground";
import { TrendingSection } from "@/components/discovery/TrendingSection";
import { TodaysDiscoverySection } from "@/components/discovery/TodaysDiscoverySection";
import { LearningPathSection } from "@/components/discovery/LearningPathSection";
import { getAllTopics, getAllVideos } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { learningPaths, resolveLearningPath } from "@/lib/learning-paths";

export const metadata: Metadata = buildPageMetadata({
  title: "Topics",
  description:
    "Deep, documentary-style explanations of the ideas shaping artificial intelligence.",
  path: "/topics",
});

// "Today's AI Discovery" picks a topic based on the current date — for
// that to actually rotate day to day (rather than freezing at whatever
// date the site last happened to build), this page regenerates at most
// once an hour via ISR instead of being purely static forever.
export const revalidate = 3600;

export default async function TopicsPage() {
  const [topics, videos] = await Promise.all([getAllTopics(), getAllVideos()]);
  const featuredPath = resolveLearningPath(learningPaths[0]!, topics);

  return (
    <Section className="relative pt-9">
      <PageAmbientBackground variant="topics" />
      <Container>
        <div className="mb-6 flex flex-col gap-2">
          <span className="text-label uppercase text-accent">Topics</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Every deep-dive, in one place.
          </h1>
        </div>

        <div className="mb-10 max-w-md">
          <SearchBox topics={topics} videos={videos} />
        </div>

        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <TodaysDiscoverySection topics={topics} />
            <LearningPathSection path={featuredPath} />
          </div>

          <TrendingSection topics={topics} />

          <div>
            <div className="mb-5">
              <span className="text-label uppercase text-accent">All Topics</span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
        </div>
      </Container>
    </Section>
  );
}
