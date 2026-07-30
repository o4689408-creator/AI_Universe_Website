"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps each ambient blob in its own "parallax layer" div. The outer
 * div's transform is set directly via JS on pointer move; the inner
 * div keeps its existing CSS animate-ambient-drift keyframe animation
 * untouched. Nesting them this way means the two transforms compose
 * visually instead of one silently overriding the other (a CSS
 * animation targeting `transform` always wins over an inline style on
 * the *same* element while it's running, so the parallax has to live
 * one level up).
 *
 * Mouse position is read on every `mousemove` event but only ever
 * applied to the DOM inside a requestAnimationFrame callback, and at
 * most once per frame (a pending-frame flag skips redundant work if
 * several mousemove events fire before the next paint) — this is the
 * one place in the codebase high-frequency event volume genuinely
 * justifies RAF batching, since mousemove can fire far faster than the
 * display can paint.
 *
 * Skipped entirely for prefers-reduced-motion, and the movement range
 * is small — peripheral atmosphere, not a gimmick. The neural-network
 * lines and node pulses are pure CSS/SVG, no JS involved.
 */
export function HeroAmbientBackground() {
  const layerOneRef = useRef<HTMLDivElement>(null);
  const layerTwoRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const latestPosition = useRef({ x: 0, y: 0 });
  const frameRequested = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function applyTransforms() {
      frameRequested.current = false;
      const { x, y } = latestPosition.current;

      if (layerOneRef.current) {
        layerOneRef.current.style.transform = `translate3d(${x * 24}px, ${y * 24}px, 0)`;
      }
      if (layerTwoRef.current) {
        layerTwoRef.current.style.transform = `translate3d(${x * -18}px, ${y * -18}px, 0)`;
      }
      if (linesRef.current) {
        linesRef.current.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`;
      }
    }

    function handleMouseMove(event: MouseEvent) {
      latestPosition.current = {
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      };
      if (!frameRequested.current) {
        frameRequested.current = true;
        requestAnimationFrame(applyTransforms);
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        ref={layerOneRef}
        className="absolute -left-32 top-0 transition-transform duration-slow ease-out"
      >
        <div className="h-[480px] w-[480px] animate-ambient-drift rounded-full bg-accent/10 blur-[120px]" />
      </div>
      <div
        ref={layerTwoRef}
        className="absolute -right-32 bottom-0 transition-transform duration-slow ease-out"
      >
        <div className="h-[560px] w-[560px] animate-ambient-drift rounded-full bg-accent/5 blur-[140px] [animation-delay:8s]" />
      </div>

      {/* Faint neural-network lines + pulsing nodes — pure SVG, no JS. */}
      <div
        ref={linesRef}
        className="absolute inset-0 flex items-center justify-center transition-transform duration-slow ease-out"
      >
        <svg
          viewBox="0 0 800 500"
          className="h-full w-full max-w-4xl opacity-[0.15]"
          preserveAspectRatio="xMidYMid slice"
        >
          <g stroke="currentColor" className="text-accent" strokeWidth="1" fill="none">
            <path d="M120,380 L280,220 L420,300 L580,140 L680,220" />
            <path d="M280,220 L360,120 L580,140" />
            <path d="M420,300 L500,380 L680,220" />
          </g>
          <g fill="currentColor" className="text-accent">
            {[
              [120, 380],
              [280, 220],
              [420, 300],
              [580, 140],
              [680, 220],
              [360, 120],
              [500, 380],
            ].map(([cx, cy], index) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="4"
                className="origin-center animate-particle-pulse"
                style={{ animationDelay: `${index * 500}ms` }}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
