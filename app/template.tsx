import type { ReactNode } from "react";

/**
 * Subtle, premium page-transition: a single fade/slide-up on every
 * route change, reusing the same animate-fade-up keyframe as the
 * homepage hero. template.tsx (unlike layout.tsx) remounts on every
 * navigation, which is what makes this replay each time rather than
 * only on first load — that remount is Next's own routing behavior,
 * not something this component needs client-side JS to trigger, so
 * this stays a Server Component (no hooks, no browser API, just a
 * static className driving a pure CSS animation).
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
