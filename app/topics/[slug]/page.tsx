import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { TableOfContents } from "@/components/article/TableOfContents";
import { AuthorBio } from "@/components/article/AuthorBio";
import { ShareButtons } from "@/components/article/ShareButtons";
import { DictionaryPopover } from "@/components/article/DictionaryPopover";
import { SourcesList } from "@/components/article/SourcesList";
import { RelatedTopics } from "@/components/article/RelatedTopics";
import { ArticleNav } from "@/components/article/ArticleNav";
import { TrackHistory } from "@/components/engagement/TrackHistory";
import { BookmarkButton } from "@/components/engagement/BookmarkButton";
import { NewsletterSection } from "@/sections/NewsletterSection";
import {
  getAdjacentTopics,
  getAllTopics,
  getTopicBySlug,
  getTopicsBySlugs,
} from "@/lib/content";
import { getVideoById } from "@/lib/videos";
import { absoluteUrl, buildArticleJsonLd, buildArticleMetadata } from "@/lib/seo";

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const topic = await getTopicBySlug(params.slug);
  if (!topic) return {};
  return buildArticleMetadata(topic);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const topic = await getTopicBySlug(params.slug);
  if (!topic) notFound();

  const [relatedTopics, { previous, next }] = await Promise.all([
    getTopicsBySlugs(topic.relatedSlugs),
    getAdjacentTopics(topic.slug),
  ]);

  const companionVideo = topic.companionVideoId
    ? getVideoById(topic.companionVideoId)
    : undefined;

  const url = absoluteUrl(`/topics/${topic.slug}`);
  const articleJsonLd = buildArticleJsonLd(topic, companionVideo);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ReadingProgress />
      <TrackHistory slug={topic.slug} />

      <ArticleHero
        category={topic.category}
        title={topic.title}
        subtitle={topic.subtitle}
        author={topic.author}
        publishedAt={topic.publishedAt}
        updatedAt={topic.updatedAt}
        readTimeMinutes={topic.readTimeMinutes}
        heroImageUrl={topic.heroImageUrl}
      />

      <Section>
        <Container wide>
          <div className="mx-auto grid max-w-wide grid-cols-1 gap-8 lg:grid-cols-[200px_1fr] lg:gap-12">
            <TableOfContents headings={topic.headings} />

            <article className="mx-auto w-full max-w-reading">
              <DictionaryPopover>
                <div className="prose-reading [&>div:first-child>p]:mt-0">{topic.content}</div>
              </DictionaryPopover>

              <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-6">
                <ShareButtons url={url} title={topic.title} />
                <BookmarkButton slug={topic.slug} variant="labeled" />
              </div>

              <AuthorBio author={topic.author} />
              <SourcesList sources={topic.sources} />
              <RelatedTopics topics={relatedTopics} />
              <ArticleNav previous={previous} next={next} />
            </article>
          </div>
        </Container>
      </Section>

      <NewsletterSection />
    </>
  );
}
