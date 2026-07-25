"use client";

import { useRef } from "react";

/**
 * Returns an onPointerDown handler that spawns a short-lived ripple
 * span at the click position inside the target element. The target
 * element needs `position: relative` and `overflow: hidden` (already
 * true of Button/ContentCard/VideoThumbnail).
 *
 * Pure CSS transition (opacity + scale), removed from the DOM after
 * it finishes — no library, no persistent state. Respects
 * reduced-motion by skipping the ripple element entirely.
 */
export function useRipple() {
  const reducedMotionRef = useRef<boolean | null>(null);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (reducedMotionRef.current === null) {
      reducedMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
    if (reducedMotionRef.current) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.borderRadius = "9999px";
    ripple.style.background = "currentColor";
    ripple.style.opacity = "0.18";
    ripple.style.pointerEvents = "none";
    ripple.style.transform = "scale(0)";
    ripple.style.transition = "transform 550ms ease-out, opacity 550ms ease-out";

    target.appendChild(ripple);
    // Force a reflow so the transition actually plays from scale(0).
    void ripple.offsetWidth;
    ripple.style.transform = "scale(1)";
    ripple.style.opacity = "0";

    setTimeout(() => ripple.remove(), 600);
  }

  return handlePointerDown;
}
