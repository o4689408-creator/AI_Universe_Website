"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "fade-up" | "scale-in" | "reading" | "slide-left" | "slide-right";

interface AnimatedRevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms — used for sequential card reveals (60-80ms apart per design spec). */
  delayMs?: number;
  /**
   * fade-up (default): translateY + opacity, standard section-reveal
   * speed. scale-in: scale + opacity + shadow — video/media cards
   * scrolling into view. reading: a much faster, smaller-movement
   * variant for in-article elements (paragraphs, headings) — quick
   * and subtle enough not to slow down reading, deliberately distinct
   * from the more pronounced section-level reveals. slide-left /
   * slide-right: translateX + opacity, for asymmetric two-column
   * layouts where text and media should visibly converge from
   * opposite sides rather than both just fading up identically.
   */
  variant?: RevealVariant;
}

const hiddenClasses: Record<RevealVariant, string> = {
  "fade-up": "translate-y-4 opacity-0",
  "scale-in": "scale-95 opacity-0 shadow-none",
  reading: "translate-y-1.5 opacity-0",
  "slide-left": "-translate-x-8 opacity-0",
  "slide-right": "translate-x-8 opacity-0",
};

const visibleClasses: Record<RevealVariant, string> = {
  "fade-up": "translate-y-0 opacity-100",
  "scale-in": "scale-100 opacity-100 shadow-md",
  reading: "translate-y-0 opacity-100",
  "slide-left": "translate-x-0 opacity-100",
  "slide-right": "translate-x-0 opacity-100",
};

const durationClasses: Record<RevealVariant, string> = {
  "fade-up": "duration-slow",
  "scale-in": "duration-slow",
  reading: "duration-fast",
  "slide-left": "duration-slow",
  "slide-right": "duration-slow",
};

/**
 * A single-pass reveal triggered once when the element enters the
 * viewport. Deliberately simple (no animation library) — this is the
 * one motion primitive every section composes with, per the
 * "purposeful motion only" principle in the design spec. Only
 * transform/opacity/shadow are animated (never layout-affecting
 * properties), so this never contributes to layout shift.
 */
export function AnimatedReveal({
  children,
  className,
  delayMs = 0,
  variant = "fade-up",
}: AnimatedRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-all ease-out",
        durationClasses[variant],
        visible ? visibleClasses[variant] : hiddenClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
