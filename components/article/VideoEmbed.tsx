"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
 * single reveal step) — a continuous, scroll-position-driven scale
 * from 96% to 100%, reflecting how far the player has crossed into
 * view. Skips entirely under prefers-reduced-motion.
 */
export function VideoEmbed({
  youtubeId,
  title,
  thumbnailUrl,
  caption,
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const [scale, setScale] = useState(0.96);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScale(1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Map intersection ratio (0 -> 1) onto a subtle scale range
        // (0.96 -> 1) so the player visibly "settles" into place as
        // more of it crosses into the viewport.
        setScale(0.96 + entry.intersectionRatio * 0.04);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="my-8">
      <div
        ref={wrapperRef}
        style={{ transform: `scale(${scale})` }}
        className="relative aspect-video w-full overflow-hidden rounded-lg bg-bg-surface-1 transition-transform duration-300 ease-out will-change-transform"
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
              className="object-cover"
            />
            <span className="absolute inset-0 bg-black/20 transition-opacity duration-base ease-out group-hover:bg-black/10" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-black/70 transition-transform duration-base ease-out group-hover:scale-105">
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
