import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroAmbientBackground } from "@/components/ui/HeroAmbientBackground";
import { HeroSceneCanvas } from "@/components/ui/HeroSceneCanvas";
import { ScrollParallaxLayer } from "@/components/ui/ScrollParallaxLayer";
import { CursorSpotlight } from "@/components/ui/CursorSpotlight";
import { StaggeredHeading } from "@/components/ui/StaggeredHeading";
import { YOUTUBE_CHANNEL_URL } from "@/lib/config";

/**
 * Purpose: establish in the first three seconds that this is a serious
 * technology platform, not a blog. Layout: full-viewport-height,
 * centered content, single primary + single secondary CTA. Visual
 * style: near-black with layered ambient depth (drifting gradient
 * blobs, faint neural-network lines, pulsing nodes) — peripheral
 * atmosphere, never a decoration that competes with the headline.
 *
 * Cinematic load sequence: the heading reveals word-by-word with a
 * soft blur-to-sharp transition (StaggeredHeading), then the subtitle
 * fades up once the heading's stagger has mostly finished, then the
 * CTAs appear last — each stage waits for the previous one, so it
 * reads as one deliberate sequence rather than everything arriving
 * at once.
 */
export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Ambient background — decorative, mouse-parallax, aria-hidden.
          Wrapped in a scroll-linked parallax layer so the whole
          atmosphere drifts and fades as the reader scrolls past the
          hero, composing with (not replacing) its own internal
          mouse-parallax transform. */}
      <ScrollParallaxLayer speed={0.25} fadeDistance={700} className="absolute inset-0">
        <HeroAmbientBackground />
        {/* Interactive 3D-style particle scene — layered on top, decorative, aria-hidden */}
        <HeroSceneCanvas />
      </ScrollParallaxLayer>

      {/* A faint spotlight the cursor carries with it — desktop only. */}
      <CursorSpotlight />
      {/*
        Text-safety layer: a cheap, static CSS gradient (no JS, no
        animation) that gently darkens the area directly behind the
        text column toward the page background color. The canvas scene
        is already kept low-opacity so this is a belt-and-suspenders
        guarantee, not a fix for a real contrast problem — readability
        must never depend on how a background animation happens to be
        positioned at any given moment.
      */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-bg-base via-bg-base/70 to-transparent md:max-w-3xl"
        aria-hidden="true"
      />

      <Container>
        <div className="relative mx-auto flex max-w-reading flex-col items-start gap-6 py-9">
          <span
            className="text-label uppercase text-text-tertiary opacity-0 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            AI Universe
          </span>

          <h1 className="text-display-2-mobile font-semibold tracking-tight text-text-primary md:text-display-1">
            <StaggeredHeading
              text="Understand Artificial Intelligence Deeply"
              startDelayMs={120}
              staggerMs={90}
            />
          </h1>

          <p
            className="max-w-xl text-body-lg text-text-secondary opacity-0 animate-fade-up"
            style={{ animationDelay: "620ms" }}
          >
            Deep research, clear explanations, and documentary-style
            storytelling — for the ideas shaping the future of AI.
          </p>

          <div
            className="flex flex-col gap-3 pt-2 opacity-0 animate-fade-up sm:flex-row"
            style={{ animationDelay: "740ms" }}
          >
            <Button href="/topics" size="lg">
              Explore Topics
            </Button>
            <Button
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              Watch on YouTube
            </Button>
          </div>
        </div>
      </Container>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse text-text-tertiary"
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M5 8L10 13L15 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
