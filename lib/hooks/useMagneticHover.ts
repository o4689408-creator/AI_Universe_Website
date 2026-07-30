"use client";

import { useEffect, useRef } from "react";

/**
 * A very subtle "magnetic" hover: the element nudges a few pixels
 * toward the cursor while hovered, then eases back to rest on
 * pointer-leave. Deliberately capped small (maxOffset) — this is meant
 * to read as "responsive," not as a distinct visible motion.
 *
 * Disabled entirely for prefers-reduced-motion and coarse-pointer
 * (touch) devices, where hover has no meaning anyway.
 */
export function useMagneticHover<T extends HTMLElement>(maxOffset = 8) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frameRequested = false;
    let latestX = 0;
    let latestY = 0;

    function apply() {
      frameRequested = false;
      el!.style.transform = `translate(${latestX}px, ${latestY}px)`;
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relativeX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relativeY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      latestX = relativeX * maxOffset;
      latestY = relativeY * maxOffset;
      if (!frameRequested) {
        frameRequested = true;
        requestAnimationFrame(apply);
      }
    }

    function handleMouseLeave() {
      latestX = 0;
      latestY = 0;
      el!.style.transform = "translate(0, 0)";
    }

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [maxOffset]);

  return ref;
}
