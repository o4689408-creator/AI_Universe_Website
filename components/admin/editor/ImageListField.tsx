"use client";

import { useCallback, useId, useState } from "react";
import { ImageUrlField } from "@/components/admin/editor/ImageUrlField";
import { cn } from "@/lib/utils";
import type { ArticleImage } from "@/types/content";

const MAX_IMAGES = 15;

const fieldClasses =
  "w-full rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent";
const labelClasses = "text-body-sm font-medium text-text-secondary";

function makeEmptyImage(): ArticleImage {
  return { id: crypto.randomUUID(), url: "", alt: "" };
}

/**
 * Up to 15 additional article images — a structured, previewable
 * extension of the same pattern ImageUrlField already established for
 * the single Hero/Featured image (URL + alt + caption + a real
 * in-browser preview), not a competing image system. A normal article
 * might use 1, 3, or 12 of these; none are required.
 *
 * Reorder is native HTML5 drag-and-drop — the platform already does
 * this, so it doesn't need a new dependency for something this small.
 *
 * State lives in the parent (ArticleForm) and is serialized here to one
 * hidden `<input name="images">` as JSON. That's the same FormData-based
 * save/autosave pipeline every other field already goes through (see
 * lib/admin/form-parsing.ts) — no separate save path for this field.
 */
export function ImageListField({
  name,
  images,
  onChange,
}: {
  name: string;
  images: ArticleImage[];
  onChange: (images: ArticleImage[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const legendId = useId();

  const updateImage = useCallback(
    (index: number, patch: Partial<ArticleImage>) => {
      onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)));
    },
    [images, onChange]
  );

  const addImage = useCallback(() => {
    if (images.length >= MAX_IMAGES) return;
    onChange([...images, makeEmptyImage()]);
  }, [images, onChange]);

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange]
  );

  const reorder = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...images];
      const [moved] = next.splice(from, 1);
      if (!moved) return;
      next.splice(to, 0, moved);
      onChange(next);
    },
    [images, onChange]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* The individual URL/alt/caption inputs below are controlled
          fields for editing convenience; this single JSON blob is the
          one lib/admin/form-parsing.ts actually reads. */}
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div className="flex items-center justify-between">
        <span id={legendId} className={labelClasses}>
          Additional images
        </span>
        <span className="text-label text-text-tertiary">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>
      <p className="-mt-2 text-label text-text-tertiary">
        Optional — used for the article&apos;s image gallery, separate from the hero/featured image above.
      </p>

      {images.length > 0 && (
        <ol className="flex flex-col gap-4" aria-labelledby={legendId}>
          {images.map((image, index) => (
            <li
              key={image.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-surface-2/40 p-4 transition-opacity duration-fast",
                dragIndex === index && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex cursor-grab select-none items-center gap-1.5 text-label font-medium text-text-tertiary active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <DragHandleIcon />
                  Image {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-label font-medium text-error transition-opacity duration-fast hover:opacity-80"
                >
                  Remove
                </button>
              </div>

              <ImageUrlField
                id={`image-${image.id}-url`}
                name={`image-${image.id}-url`}
                label="Image URL"
                value={image.url}
                onChange={(url) => updateImage(index, { url })}
                placeholder="https://images.unsplash.com/..."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClasses}>Alt text</span>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(event) => updateImage(index, { alt: event.target.value })}
                    placeholder="Describes the image for screen readers"
                    className={fieldClasses}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClasses}>Caption (optional)</span>
                  <input
                    type="text"
                    value={image.caption ?? ""}
                    onChange={(event) => updateImage(index, { caption: event.target.value })}
                    className={fieldClasses}
                  />
                </label>
              </div>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={addImage}
        disabled={images.length >= MAX_IMAGES}
        className="self-start rounded-md border border-border-subtle px-4 py-2 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add image
      </button>
    </div>
  );
}

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 12 16" width="10" height="14" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="2" r="1.2" />
      <circle cx="9" cy="2" r="1.2" />
      <circle cx="3" cy="8" r="1.2" />
      <circle cx="9" cy="8" r="1.2" />
      <circle cx="3" cy="14" r="1.2" />
      <circle cx="9" cy="14" r="1.2" />
    </svg>
  );
}
