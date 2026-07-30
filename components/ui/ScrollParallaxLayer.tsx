"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollParallaxLayerProps {
  children: ReactNode;
  /** How far the layer drifts per pixel scrolled — small values only; this is atmosphere, not a scroll-jacking effect. */
  speed?: number;
  /** Fades the layer out as the user scrolls past `fadeDistance` px. */
  fadeDistance?: number;
  className?: string;
}

/**
 * Wraps hero background layers (ambient blobs, particle canvas) in a
 * scroll-linked depth effect: drifts slightly and fades out as the
 * page scrolls past the hero, composing on top of whatever transform
 * the wrapped content already applies to itself internally (e.g.
 * HeroAmbientBackground's own mouse-parallax) since this sets the
 * transform on an *outer* wrapping element, one level above where
 * that inner logic writes to its own refs — the two never fight over
 * the same style property.
 *
 * Uses `translate3d` (GPU-composited) and reads scroll position only
 * inside a requestAnimationFrame callback, at most once per frame, to
 * stay smooth. Skipped entirely under prefers-reduced-motion.
 */
export function ScrollParallaxLayer({
  children,
  speed = 0.25,
  fadeDistance = 700,
  className,
}: ScrollParallaxLayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frameRequested = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function applyTransform() {
      frameRequested.current = false;
      const node = wrapperRef.current;
      if (!node) return;
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / fadeDistance, 1);
      node.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      node.style.opacity = String(1 - progress);
    }

    function handleScroll() {
      if (!frameRequested.current) {
        frameRequested.current = true;
        requestAnimationFrame(applyTransform);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, fadeDistance]);

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
}
