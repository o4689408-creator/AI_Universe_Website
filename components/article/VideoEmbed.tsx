"use client";

import { useState } from "react";
import Image from "next/image";
import { useScaleIntoView } from "@/lib/hooks/useScaleIntoView";

interface VideoEmbedProps {
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  caption?: string;
}

/**
 * Facade pattern: renders a static thumbnail + play button until the
 * reader clicks, only then mounting the actual YouTube iframe. This
 * alone saves real load time on every article page that has an
 * embedded video (per the blueprint's performance requirements).
 *
 * Also scales in gradually as it enters the viewport (rather than a
 * single reveal step) via useScaleIntoView — a continuous,
 * scroll-position-driven scale reflecting how far the player has
 * crossed into view.
 */
export function VideoEmbed({
  youtubeId,
  title,
  thumbnailUrl,
  caption,
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const { ref, scale } = useScaleIntoView<HTMLDivElement>(0.96);

  return (
    <figure className="my-8">
      <div
        ref={ref}
        style={{ transform: `scale(${scale})` }}
        className="relative aspect-video w-full overflow-hidden rounded-lg bg-bg-surface-1 shadow-[var(--shadow-md)] transition-transform duration-300 ease-out will-change-transform"
      >
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
          >
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 680px, 100vw"
              className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-black/25 transition-opacity duration-base ease-out group-hover:bg-black/15" />
            <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-glow-accent backdrop-blur-md transition-transform duration-base ease-out group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="white" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-body-sm text-text-secondary">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
