"use client";

import type { ReactNode } from "react";

/**
 * Subtle, premium page-transition: a single fade/slide-up on every
 * route change, reusing the same animate-fade-up keyframe as the
 * homepage hero. template.tsx (unlike layout.tsx) remounts on every
 * navigation, which is what makes this replay each time rather than
 * only on first load.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
