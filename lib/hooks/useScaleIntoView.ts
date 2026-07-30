import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to an element and a scale value that rises
 * from `minScale` to 1 as the element crosses into the viewport,
 * driven by IntersectionObserver's intersectionRatio (continuous, not
 * a single on/off reveal step) — shared by VideoEmbed.tsx (in-article
 * players) and VideoThumbnail.tsx (homepage video cards) so both
 * "settle into place" the same way as they scroll into view.
 *
 * Returns scale = 1 immediately under prefers-reduced-motion.
 */
export function useScaleIntoView<T extends HTMLElement>(minScale = 0.94) {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState(minScale);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScale(1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setScale(minScale + entry.intersectionRatio * (1 - minScale));
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [minScale]);

  return { ref, scale };
}
