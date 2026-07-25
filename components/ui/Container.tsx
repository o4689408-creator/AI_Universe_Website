import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Constrains to the wide content width (1100px) instead of the full page width (1280px). */
  wide?: boolean;
}

/**
 * The single horizontal-width authority for the site. Pages should
 * never hardcode max-width or horizontal padding directly — wrap
 * content in Container so the page grid stays consistent as new
 * sections/pages are added.
 */
export function Container({ children, className, wide = false }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6",
        wide ? "max-w-wide" : "max-w-page",
        className
      )}
    >
      {children}
    </div>
  );
}
