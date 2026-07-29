"use client";

import { useEffect, useRef } from "react";

/**
 * A soft, low-opacity radial light that follows the cursor within its
 * parent — a "spotlight" the pointer carries with it, distinct from
 * (and layered above) HeroAmbientBackground's slower whole-scene
 * parallax drift. Kept deliberately faint (12% peak opacity, heavily
 * blurred) so it reads as an ambient interactive touch rather than a
 * cursor-tracking gimmick that competes with the headline.
 *
 * Desktop/fine-pointer only: skipped for coarse (touch) pointers,
 * where there's no persistent cursor to spotlight, and skipped for
 * prefers-reduced-motion.
 */
export function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);
  const frameRequested = useRef(false);
  const latestPosition = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const parentElement = spotRef.current?.parentElement;
    if (!parentElement) return;
    const parent: HTMLElement = parentElement;

    function applyPosition() {
      frameRequested.current = false;
      if (spotRef.current) {
        spotRef.current.style.transform = `translate3d(${latestPosition.current.x}px, ${latestPosition.current.y}px, 0)`;
        spotRef.current.style.opacity = "1";
      }
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = parent.getBoundingClientRect();
      latestPosition.current = {
        x: event.clientX - rect.left - 220,
        y: event.clientY - rect.top - 220,
      };
      if (!frameRequested.current) {
        frameRequested.current = true;
        requestAnimationFrame(applyPosition);
      }
    }

    function handleMouseLeave() {
      if (spotRef.current) spotRef.current.style.opacity = "0";
    }

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 h-[440px] w-[440px] rounded-full bg-accent/[0.12] opacity-0 blur-[100px] transition-opacity duration-slow ease-out"
    />
  );
}
