import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ColorTextTone = "accent" | "success" | "warning" | "error";

interface ColorTextProps {
  color?: ColorTextTone;
  children: ReactNode;
}

const toneClasses: Record<ColorTextTone, string> = {
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

/**
 * Usage in MDX: <ColorText color="accent">emphasized phrase</ColorText>
 * Deliberately restricted to the four design-system tones (no arbitrary
 * hex) — this is what keeps "colored text" from turning into visual
 * noise across dozens of articles written by different people later.
 */
export function ColorText({ color = "accent", children }: ColorTextProps) {
  return <span className={cn("font-medium", toneClasses[color])}>{children}</span>;
}
