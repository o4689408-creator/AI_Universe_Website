import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { Button } from "@/components/ui/Button";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { YOUTUBE_CHANNEL_URL } from "@/lib/config";
import type { Video } from "@/types/content";

interface YouTubeSectionProps {
  videos: Video[];
}

/**
 * Purpose: the channel is the primary traffic driver initially — this
 * section funnels viewers into the site (and vice versa). Layout: two
 * columns — channel branding + subscribe CTA on the left, a
 * horizontally-scrollable row of latest video thumbnails on the right.
 * Each thumbnail routes to its companion article (not straight to
 * YouTube) so the video is experienced in context.
 */
export function YouTubeSection({ videos }: YouTubeSectionProps) {
  if (videos.length === 0) return null;

  return (
    <Section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full blur-[130px]"
        style={{ background: "hsla(190, 75%, 60%, 0.06)" }}
        aria-hidden="true"
      />
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_1.6fr] md:items-center md:gap-10 lg:grid-cols-[minmax(0,1fr)_2fr] lg:gap-12">
          <AnimatedReveal variant="slide-left" className="flex flex-col items-start gap-4">
            <span className="text-label uppercase text-accent">
              On YouTube
            </span>
            <h2 className="text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
              Watch the deep-dives.
            </h2>
            <p className="text-body text-text-secondary">
              Every article has a companion video breaking it down —
              join the channel to catch new ones first.
            </p>
            <Button
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              Subscribe on YouTube
            </Button>
          </AnimatedReveal>

          <AnimatedReveal variant="slide-right" className="flex gap-4 overflow-x-auto pb-2">
            {videos.map((video, index) => (
              <AnimatedReveal key={video.id} variant="scale-in" delayMs={index * 90} className="shrink-0">
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
          </AnimatedReveal>
        </div>
      </Container>
    </Section>
  );
}
