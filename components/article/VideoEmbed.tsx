"use client";

import { useState } from "react";
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
 */
export function VideoEmbed({
  youtubeId,
  title,
  thumbnailUrl,
  caption,
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="my-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-bg-surface-1">
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
