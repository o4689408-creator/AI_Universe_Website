"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  src: string;
  alt: string;
  /** The already-rendered thumbnail/figure — cloned as the trigger. */
  children: ReactNode;
  className?: string;
}

/**
 * Wraps any image with a click-to-zoom viewer: a blurred, dimmed
 * backdrop and the image scaling up to a large centered view. Used by
 * MediaFigure (article diagrams/photos) so every in-article image
 * gets the same premium viewer without each call site building one.
 *
 * Renders the overlay via a portal into document.body so it always
 * sits above article content regardless of the figure's own stacking
 * context, and locks background scroll while open.
 */
export function ImageLightbox({ src, alt, children, className }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Expand image: ${alt || "article figure"}`}
        className={cn(
          "group relative block w-full cursor-zoom-in overflow-hidden rounded-lg",
          className
        )}
      >
        {children}
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-base ease-out group-hover:bg-black/20 group-hover:opacity-100"
          aria-hidden="true"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <ZoomIcon />
          </span>
        </span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Expanded image"}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-base/90 backdrop-blur-xl p-4 duration-base ease-out animate-fade-up sm:p-10"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close image viewer"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-bg-surface-2/80 text-text-primary shadow-md transition-transform duration-fast ease-out hover:scale-105 sm:right-8 sm:top-8"
            >
              <CloseIcon />
            </button>
            <div
              className="relative h-full max-h-[85vh] w-full max-w-6xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function ZoomIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.3 10.3L13.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 5.2V8.8M5.2 7H8.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
