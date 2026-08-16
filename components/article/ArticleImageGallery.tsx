"use client";

import { useState } from "react";
import Image from "next/image";
import type { ArticleImage } from "@/types/content";

/**
 * Renders an article's additional images (0–15, see
 * components/admin/editor/ImageListField.tsx) as a responsive gallery.
 * Distinct from the single hero/featured image at the top of the page —
 * this is for a set of supporting images within the article.
 *
 * Each image degrades independently: if a URL that validated fine at
 * save time later goes offline, that one figure quietly removes itself
 * instead of showing a broken-image icon or taking the rest of the page
 * down with it.
 */
export function ArticleImageGallery({ images }: { images?: ArticleImage[] }) {
  if (!images || images.length === 0) return null;

  return (
    <section aria-label="Article images" className="my-10 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <GalleryFigure key={image.id} image={image} priority={index === 0} />
        ))}
      </div>
    </section>
  );
}

function GalleryFigure({ image, priority }: { image: ArticleImage; priority: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-2">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image.url}
          alt={image.alt || ""}
          fill
          sizes="(max-width: 640px) 92vw, 45vw"
          className="object-cover"
          priority={priority}
          onError={() => setFailed(true)}
        />
      </div>
      {image.caption && (
        <figcaption className="px-4 py-3 text-body-sm text-text-tertiary">{image.caption}</figcaption>
      )}
    </figure>
  );
}
