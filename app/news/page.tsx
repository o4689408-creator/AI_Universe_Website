import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { ContentCard } from "@/components/content/ContentCard";
import { getAllTopics, getLatestVideos } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = buildPageMetadata({
  title: "AI News",
  description: "The latest AI Universe coverage — model launches, research breakdowns, and industry developments.",
  path: "/news",
});

export const revalidate = 3600;

function formatReadTime(minutes: number) {
  return `${minutes} min read`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

/**
 * Every card here is a real article from lib/content.ts (the same
 * MDX + MongoDB-CMS content used everywhere else on the site) — there
 * is no separate news-ingestion feed wired up yet, and nothing here
 * is invented. Categories double as a lightweight organization
 * ("Frontier AI", "AI Foundations", "Models") since that's what the
 * real content already covers, rather than building a second,
 * parallel taxonomy. The Admin CMS's existing category/tag/featured/
 * scheduled-publish system (see /admin) is already the exact pipeline
 * ("ingest -> review -> approval -> publish -> homepage/news page")
 * a real news source could be wired into later — an admin creates an
 * article, marks it Featured or Trending, and it appears here
 * immediately, with no changes needed to this page.
 */
export default async function NewsPage() {
  const [topics, videos] = await Promise.all([getAllTopics(), getLatestVideos(4)]);

  const [featured, ...rest] = topics;
  const latest = rest.slice(0, 6);
  const categories = Array.from(new Set(topics.map((t) => t.category)));

  return (
    <>
      <Section className="pb-8 pt-10 sm:pt-14">
        <Container>
          <AnimatedReveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="flex items-center gap-2 text-label font-semibold uppercase tracking-wide text-accent">
                  📰 AI News
                </span>
                <h1 className="mt-2 text-display-2-mobile font-semibold tracking-tight text-text-primary md:text-display-2">
                  What&apos;s happening in AI
                </h1>
                <p className="mt-2 max-w-xl text-body-lg text-text-secondary">
                  {SITE_NAME}&apos;s own coverage of frontier models, research, and the AI industry — updated as new
                  pieces publish.
                </p>
              </div>
            </div>
          </AnimatedReveal>
        </Container>
      </Section>

      {featured && (
        <Section className="pb-12">
          <Container>
            <AnimatedReveal>
              <p className="mb-4 text-label font-semibold uppercase tracking-wide text-text-tertiary">
                Featured story
              </p>
              <ContentCard
                href={`/topics/${featured.slug}`}
                slug={featured.slug}
                title={featured.title}
                description={featured.subtitle}
                imageUrl={featured.heroImageUrl}
                category={featured.category}
                meta={formatReadTime(featured.readTimeMinutes)}
                featured
              />
            </AnimatedReveal>
          </Container>
        </Section>
      )}

      {latest.length > 0 && (
        <Section className="pb-12">
          <Container>
            <AnimatedReveal>
              <p className="mb-4 text-label font-semibold uppercase tracking-wide text-text-tertiary">
                Latest coverage
              </p>
            </AnimatedReveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {latest.map((topic, index) => (
                <AnimatedReveal key={topic.slug} delayMs={index * 60}>
                  <ContentCard
                    href={`/topics/${topic.slug}`}
                    slug={topic.slug}
                    title={topic.title}
                    description={topic.subtitle}
                    imageUrl={topic.heroImageUrl}
                    category={topic.category}
                    meta={`${formatReadTime(topic.readTimeMinutes)} \u00b7 ${formatDate(topic.publishedAt)}`}
                  />
                </AnimatedReveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {categories.length > 0 && (
        <Section className="pb-12">
          <Container>
            <AnimatedReveal>
              <p className="mb-4 text-label font-semibold uppercase tracking-wide text-text-tertiary">
                Explore by topic
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href="/topics"
                    className="rounded-full border border-border-subtle bg-bg-surface-1 px-4 py-2 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-accent/40 hover:text-accent"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </AnimatedReveal>
          </Container>
        </Section>
      )}

      {videos.length > 0 && (
        <Section className="pb-16">
          <Container>
            <AnimatedReveal>
              <p className="mb-4 text-label font-semibold uppercase tracking-wide text-text-tertiary">
                Video coverage
              </p>
            </AnimatedReveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {videos.map((video, index) => (
                <AnimatedReveal key={video.id} delayMs={index * 60}>
                  <Link
                    href={video.companionTopicSlug ? `/topics/${video.companionTopicSlug}` : "/videos"}
                    className="group block overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-1 transition-colors duration-base hover:border-accent/30"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-bg-surface-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <p className="p-3 text-body-sm font-medium text-text-primary">{video.title}</p>
                  </Link>
                </AnimatedReveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section className="pb-20">
        <Container>
          <AnimatedReveal>
            <div className="rounded-xl border border-dashed border-border-subtle p-8 text-center">
              <p className="text-body-sm text-text-tertiary">
                More AI news coverage is on the way. Every piece here comes from {SITE_NAME}&apos;s own editorial
                team via the same Admin CMS that powers the rest of the site — nothing on this page is a
                third-party feed or automated summary.
              </p>
            </div>
          </AnimatedReveal>
        </Container>
      </Section>
    </>
  );
}
