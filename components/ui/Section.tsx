import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionBackground = "base" | "surface-1";

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: SectionBackground;
  /** Adds a top hairline border — used to visually separate sections like the footer. */
  divider?: boolean;
  id?: string;
}

const backgroundStyles: Record<SectionBackground, string> = {
  base: "bg-bg-base",
  "surface-1": "bg-bg-surface-1",
};

/**
 * Every major homepage/page section should be wrapped in Section
 * rather than applying padding ad hoc — this is what keeps the
 * 96–192px vertical rhythm (design spec §1.6) consistent site-wide
 * instead of drifting section by section.
 */
export function Section({
  children,
  className,
  background = "base",
  divider = false,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-8 md:py-9 lg:py-10",
        backgroundStyles[background],
        divider && "border-t border-border-subtle",
        // Any section that's a same-page jump target (id set) needs
        // room to clear the sticky header — otherwise the browser
        // scrolls it flush to the very top of the viewport and its
        // heading ends up hidden behind the translucent header bar.
        id && "scroll-mt-20",
        className
      )}
    >
      {children}
    </section>
  );
}
