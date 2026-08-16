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
import { ArticleImageGallery } from "@/components/article/ArticleImageGallery";
import { QuizSeries } from "@/components/article/QuizSeries";
import { SourcesList } from "@/components/article/SourcesList";
import { RelatedTopics } from "@/components/article/RelatedTopics";
import { ArticleNav } from "@/components/article/ArticleNav";
import { TrackHistory } from "@/components/engagement/TrackHistory";
import { BookmarkButton } from "@/components/engagement/BookmarkButton";
import { NewsletterSection } from "@/sections/NewsletterSection";
import {
  getAdjacentTopics,
  getTopicBySlug,
  getTopicsBySlugs,
} from "@/lib/content";
import { listTopicSlugs } from "@/lib/mdx";
import { getVideoById } from "@/lib/videos";
import { absoluteUrl, buildArticleJsonLd, buildArticleMetadata } from "@/lib/seo";

interface ArticlePageProps {
  params: { slug: string };
}

// Safety-net ISR: lib/admin/revalidate.ts already triggers an
// immediate, precise on-demand revalidation of this exact path the
// moment an article is created/edited/published from the Admin CMS,
// but a time-based fallback means a missed/failed revalidation call
// (a transient error, a direct DB edit) still self-heals within an
// hour rather than staying stale until the next full deploy.
export const revalidate = 3600;

// MDX-only on purpose (listTopicSlugs(), NOT getAllTopics()).
//
// getAllTopics() merges MDX + MongoDB-backed CMS articles — correct
// for every *runtime* read, but generateStaticParams() runs during
// the build's "Collecting page data" step, which has no guaranteed
// MongoDB network path (this is exactly what broke: Vercel's build
// container hit `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` trying to reach
// MongoDB Atlas from here). The four hand-authored .mdx articles need
// zero database access to know their own slugs, so this list is
// MDX-only and needs nothing but the filesystem.
//
// This does NOT remove CMS articles from the public site: slugs not
// covered here simply aren't pre-built. `dynamicParams` defaults to
// true, so a CMS article's page (and its metadata, below) still
// renders correctly the first time someone actually requests it — on
// a real deployed serverless function, with real runtime network
// access to MongoDB, not the build container. It's then cached like
// any other ISR page (see `revalidate` above). Same principle already
// applied to app/topics/[slug]/opengraph-image.tsx for the same
// reason.
//
// `force-dynamic` was considered and deliberately NOT used: it would
// disable static generation for every slug, including the four MDX
// articles that have no reason to lose it, trading away real
// performance to solve a problem that's actually specific to
// build-time-only Mongo access.
export async function generateStaticParams() {
  return listTopicSlugs().map((slug) => ({ slug }));
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

  // CMS-authored articles resolve their companion video directly from
  // the pasted YouTube URL (topic.companionVideo — see
  // lib/admin/articles.ts#buildCompanionVideo); MDX-authored articles
  // keep resolving through the curated lib/videos.ts registry exactly
  // as before.
  const companionVideo =
    topic.companionVideo ?? (topic.companionVideoId ? getVideoById(topic.companionVideoId) : undefined);

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

              <ArticleImageGallery images={topic.images} />

              <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-6">
                <ShareButtons url={url} title={topic.title} />
                <BookmarkButton slug={topic.slug} variant="labeled" />
              </div>

              {topic.quiz && topic.quiz.length > 0 && (
                <div className="mt-10 border-t border-border-subtle pt-10">
                  <QuizSeries questions={topic.quiz} />
                </div>
              )}

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
