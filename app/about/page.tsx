import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PageAmbientBackground } from "@/components/ui/PageAmbientBackground";
import { SITE_NAME, YOUTUBE_CHANNEL_URL } from "@/lib/config";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description: `Why ${SITE_NAME} exists, and what makes it different from a typical AI blog.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <Section className="relative pt-9">
      <PageAmbientBackground variant="about" />
      <Container>
        <div className="mx-auto flex max-w-reading flex-col gap-6">
          <span className="text-label uppercase text-accent">About</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Understanding AI shouldn&apos;t require choosing between hype
            and jargon.
          </h1>

          <p className="text-body-lg text-text-secondary">
            {SITE_NAME} exists because most explanations of artificial
            intelligence fall into one of two traps: breathless hype with
            no substance, or dense academic writing with no narrative.
            We build the third option — deep, accurate, documentary-style
            explanations that respect both your time and your intelligence.
          </p>

          <h2 className="mt-4 text-heading-3 font-semibold text-text-primary">
            What we believe
          </h2>
          <p className="text-body text-text-secondary">
            Depth beats volume. We&apos;d rather publish a handful of
            flawless deep-dives than dozens of shallow posts chasing
            search trends. Every topic is researched thoroughly, sourced
            transparently, and revisited when the underlying facts change.
          </p>

          <h2 className="mt-4 text-heading-3 font-semibold text-text-primary">
            How this connects to YouTube
          </h2>
          <p className="text-body text-text-secondary">
            Every article on this site has a companion video, and every
            video has a companion article — two formats for the same
            deep-dive, so you can read, watch, or both.
          </p>

          <div className="pt-2">
            <Button href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" variant="secondary">
              Watch on YouTube
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
