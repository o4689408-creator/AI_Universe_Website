import type { ReactNode } from "react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

/**
 * A responsive grid of big-number stat cards for an article body.
 *
 * Usage in MDX:
 *   <StatsGrid>
 *     <Stat value="54%" label="More token-efficient on agentic coding tasks" />
 *     <Stat value="88.8%" label="Terminal-Bench 2.1 score" />
 *   </StatsGrid>
 *
 * 2 columns on mobile, up to 4 on desktop — never more than 4 per row
 * even with more children, so individual cards stay legible rather
 * than shrinking indefinitely.
 */
export function StatsGrid({ children }: { children?: ReactNode }) {
  return (
    <AnimatedReveal variant="scale-in">
      <div className="my-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {children}
      </div>
    </AnimatedReveal>
  );
}

interface StatProps {
  value: string;
  label: string;
  /** Optional short context line under the label, e.g. "vs. 47.9% for GPT-5.5" */
  sublabel?: string;
}

export function Stat({ value, label, sublabel }: StatProps) {
  return (
    <div className="group flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-bg-surface-1 p-4 transition-all duration-base ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow-accent sm:p-5">
      <span className="bg-gradient-to-br from-text-primary to-accent bg-clip-text text-heading-2-mobile font-bold tabular-nums text-transparent sm:text-heading-1">
        {value}
      </span>
      <span className="text-body-sm leading-snug text-text-secondary">{label}</span>
      {sublabel && <span className="text-label text-text-tertiary">{sublabel}</span>}
    </div>
  );
}
