import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { PageAmbientBackground } from "@/components/ui/PageAmbientBackground";
import { getAllVideos } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Videos",
  description:
    "Watch the companion breakdowns for every AI Universe deep-dive, straight from the YouTube channel.",
  path: "/videos",
});

export default async function VideosPage() {
  const videos = await getAllVideos();

  return (
    <Section className="relative pt-9">
      <PageAmbientBackground variant="videos" />
      <Container>
        <div className="mb-6 flex flex-col gap-2">
          <span className="text-label uppercase text-accent">Videos</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Every deep-dive, on video.
          </h1>
        </div>

        <div className="flex flex-wrap gap-6">
          {videos.map((video, index) => (
            <AnimatedReveal key={video.id} variant="scale-in" delayMs={index * 90}>
              <VideoThumbnail
                href={
                  video.companionTopicSlug
                    ? `/topics/${video.companionTopicSlug}`
                    : `/videos/${video.slug}`
                }
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
              />
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
