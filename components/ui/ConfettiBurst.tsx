"use client";

import { useMemo } from "react";

const CONFETTI_COLORS = ["#4C7DFF", "#7DA2FF", "#FFC24C", "#4CE0B3", "#FF6B9D"];

/**
 * A lightweight, pure-CSS confetti burst — generated once per mount
 * (not per render) and animated via the shared `pop-in` keyframe.
 * Shared between the newsletter success state and the article quiz's
 * correct-answer celebration, so the two don't drift into two subtly
 * different implementations of the same effect.
 */
export function ConfettiBurst({ count = 18 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        angle: (360 / count) * index + (Math.random() * 12 - 6),
        distance: 55 + Math.random() * 40,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length] ?? CONFETTI_COLORS[0]!,
        delay: Math.random() * 120,
        size: 5 + Math.random() * 4,
      })),
    [count]
  );

  return (
    <>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full opacity-0 animate-pop-in"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            animationDuration: "900ms",
            animationFillMode: "forwards",
            transform: `rotate(${piece.angle}deg) translate(${piece.distance}px) rotate(-${piece.angle}deg)`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
