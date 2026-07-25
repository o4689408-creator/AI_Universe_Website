import type { Metadata } from "next";
import { HeroSection } from "@/sections/HeroSection";
import { DiscoverySection } from "@/sections/DiscoverySection";
import { ContinueExploringSection } from "@/sections/ContinueExploringSection";
import { FeaturedTopicSection } from "@/sections/FeaturedTopicSection";
import { LatestContentSection } from "@/sections/LatestContentSection";
import { YouTubeSection } from "@/sections/YouTubeSection";
import { NewsletterSection } from "@/sections/NewsletterSection";
import { HeadlineTicker } from "@/components/ui/HeadlineTicker";
import { getAllTopics, getAllVideos } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/config";
import { buildOrganizationJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `${SITE_NAME} — Understand Artificial Intelligence, Deeply`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const topics = await getAllTopics();
  const videos = await getAllVideos();

  // With only a handful of flagship topics at launch, the Featured and
  // Latest sections deliberately draw from the same small set — the
  // framing and layout differ (one hero card vs. a grid), which is the
  // intended reading at this stage rather than a bug to fix by adding
  // more (thin) content. See blueprint on depth-first launch strategy.
  const jsonLd = buildOrganizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeadlineTicker topics={topics} />
      <HeroSection />
      <DiscoverySection topics={topics} />
      <ContinueExploringSection topics={topics} />
      <FeaturedTopicSection topics={topics} />
      <LatestContentSection topics={topics} />
      <YouTubeSection videos={videos} />
      <NewsletterSection />
    </>
  );
}
