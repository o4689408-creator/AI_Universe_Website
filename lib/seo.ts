import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import type { Topic, Video } from "@/types/content";

/**
 * SEO templates.
 *
 * Every page's metadata and structured data should be built through
 * these functions rather than constructed inline — this is what makes
 * "add a new article" or "add a new content type" a call to one of
 * these helpers instead of re-deriving canonical URLs, OG tags, and
 * JSON-LD from scratch each time.
 */

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

/** Standard template for simple static pages (About, Contact, legal, etc). */
export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      type: "website",
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Standard template for article (Topic) pages. Every field an editor
 * can override from the Admin CMS's SEO panel (types/content.ts) is
 * optional and falls back to the equivalent editorial field — MDX
 * articles, which never set any of these, get exactly the same
 * metadata they always did.
 */
export function buildArticleMetadata(topic: Topic): Metadata {
  const canonicalUrl = topic.canonicalUrl?.trim() || absoluteUrl(`/topics/${topic.slug}`);
  const title = topic.seoTitle?.trim() || topic.title;
  const description = topic.metaDescription?.trim() || topic.subtitle;
  const ogTitle = topic.ogTitle?.trim() || title;
  const ogDescription = topic.ogDescription?.trim() || description;
  const ogImageUrl = topic.ogImageUrl?.trim();
  const twitterImageUrl = topic.twitterImageUrl?.trim() || ogImageUrl;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      publishedTime: topic.publishedAt,
      modifiedTime: topic.updatedAt,
      // Omitting `images` here (rather than setting it to the dynamic
      // /opengraph-image route explicitly) lets Next.js fall back to
      // that file-convention route automatically when no override is
      // set — exactly today's behavior for every existing article.
      ...(ogImageUrl && { images: [{ url: ogImageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(twitterImageUrl && { images: [twitterImageUrl] }),
    },
  };
}

/** Standard Article + (optional) VideoObject JSON-LD template. */
export function buildArticleJsonLd(topic: Topic, companionVideo?: Video) {
  const url = absoluteUrl(`/topics/${topic.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.title,
    description: topic.subtitle,
    image: `${url}/opengraph-image`,
    datePublished: topic.publishedAt,
    dateModified: topic.updatedAt,
    author: {
      "@type": "Organization",
      name: topic.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    mainEntityOfPage: url,
    ...(companionVideo && {
      video: {
        "@type": "VideoObject",
        name: companionVideo.title,
        description: topic.subtitle,
        thumbnailUrl: absoluteUrl(companionVideo.thumbnailUrl),
        uploadDate: companionVideo.publishedAt,
        embedUrl: `https://www.youtube.com/embed/${companionVideo.youtubeId}`,
      },
    }),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "A premium knowledge platform for understanding artificial intelligence.",
  };
}
