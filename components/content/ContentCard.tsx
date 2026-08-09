"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/engagement/BookmarkButton";
import { useRipple } from "@/lib/hooks/useRipple";

interface ContentCardProps {
  href: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  meta?: string;
  /** Larger hero-style treatment — used once per page, for the single most important card. */
  featured?: boolean;
  className?: string;
  /** Topic slug — shows the bookmark toggle in the corner when provided. */
  slug?: string;
}

const MAX_TILT_DEGREES = 6;
const PRESS_SCALE = 0.985;

/**
 * One card component for every content type (Topic, Video, and future
 * News/Tool/Model entries) — variation happens through props, not
 * through parallel one-off card components.
 *
 * Structure note: the clickable area is an absolutely-positioned
 * "stretched link" sibling, not a wrapper around everything — this is
 * what lets the bookmark button sit on the card without ever nesting
 * a <button> inside an <a> (invalid HTML; also breaks keyboard/screen
 * reader semantics). The bookmark button sits at a higher z-index and
 * intercepts its own clicks; everywhere else on the card, the stretched
 * link handles navigation.
 *
 * Also includes the subtle CSS-only 3D tilt on hover (perspective +
 * rotateX/Y driven by cursor position) plus a soft press-down scale
 * and a click ripple. All three are combined into one inline
 * `transform` set imperatively on the DOM node — mixing an inline
 * style with a separate CSS class-based transform wouldn't work
 * reliably (inline styles win), so press/tilt have to share the same
 * pipeline rather than being applied independently.
 */
export function ContentCard({
  href,
  title,
  description,
  imageUrl,
  category,
  meta,
  featured = false,
  className,
  slug,
}: ContentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const latestTilt = useRef({ rotateX: 0, rotateY: 0 });
  const pressedRef = useRef(false);
  const frameRequested = useRef(false);
  const handleRipple = useRipple();

  function applyTransform() {
    frameRequested.current = false;
    const card = cardRef.current;
    if (!card) return;
    const { rotateX, rotateY } = latestTilt.current;
    const scale = pressedRef.current ? PRESS_SCALE : 1;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(${scale})`;
  }

  function requestFrame() {
    if (!frameRequested.current) {
      frameRequested.current = true;
      requestAnimationFrame(applyTransform);
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;
    latestTilt.current = {
      rotateY: (relativeX - 0.5) * MAX_TILT_DEGREES,
      rotateX: (0.5 - relativeY) * MAX_TILT_DEGREES,
    };
    requestFrame();
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    pressedRef.current = false;
    card.style.transform = "";
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pressedRef.current = true;
    requestFrame();
    handleRipple(event);
  }

  function handlePointerUp() {
    pressedRef.current = false;
    requestFrame();
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-1 transition-[transform,border-color,box-shadow] duration-base ease-out will-change-transform hover:border-accent/30 hover:shadow-glow-accent",
        featured && "rounded-xl md:grid md:grid-cols-2 md:items-center",
        className
      )}
    >
      <Link href={href} aria-label={title} className="absolute inset-0 z-10">
        <span className="sr-only">{title}</span>
      </Link>

      {slug && (
        <div className="absolute right-3 top-3 z-20">
          <BookmarkButton slug={slug} />
        </div>
      )}

      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden",
          featured && "md:aspect-auto md:h-full"
        )}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          priority={featured}
          sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
        />
        {/* Bottom-up gradient — adds depth to the image itself and is
            what the reading-time pill sits on for guaranteed contrast
            regardless of the underlying photo's own colors. */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0"
          aria-hidden="true"
        />
        {meta && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-label font-medium text-white backdrop-blur-sm">
            <ClockIcon className="h-3 w-3" />
            {meta}
          </span>
        )}
      </div>

      <div className={cn("flex flex-col gap-2 p-5", featured && "md:p-8")}>
        {category && (
          <span className="text-label uppercase text-accent">{category}</span>
        )}
        <h3
          className={cn(
            "font-semibold text-text-primary transition-colors duration-fast ease-out group-hover:text-accent",
            featured ? "text-heading-2-mobile md:text-heading-2" : "text-heading-4"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-body-sm text-text-secondary">{description}</p>
        )}
        <span className="mt-1 flex items-center gap-1 text-body-sm font-medium text-accent opacity-0 transition-all duration-base ease-out group-hover:translate-x-1 group-hover:opacity-100">
          Read article
          <ArrowIcon className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
