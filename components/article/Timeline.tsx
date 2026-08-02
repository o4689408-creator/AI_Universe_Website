import type { ReactNode } from "react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

/**
 * A vertical timeline for chronological or roadmap-style content.
 *
 * Usage in MDX:
 *   <Timeline>
 *     <TimelineItem date="March 2026" title="GPT-5.4 released">
 *       Body text for this milestone.
 *     </TimelineItem>
 *   </Timeline>
 */
export function Timeline({ children }: { children?: ReactNode }) {
  return (
    // The arbitrary selector hides the connector line below the final
    // item — `last:` alone doesn't work here since the line is nested
    // two levels deep (not a direct sibling at this container's
    // level), so Tailwind's `last:` would apply to the wrong element.
    <div className="my-8 flex flex-col [&>*:last-child_.timeline-connector]:hidden">
      {children}
    </div>
  );
}

interface TimelineItemProps {
  date: string;
  title: string;
  children?: ReactNode;
  /** Marks the current/most recent entry with an accent-filled dot and glow. */
  current?: boolean;
}

export function TimelineItem({ date, title, children, current = false }: TimelineItemProps) {
  return (
    <AnimatedReveal variant="reading" className="relative flex gap-5 pb-8 last:pb-0">
      <div className="flex flex-col items-center">
        <span
          className={
            current
              ? "z-10 flex h-3.5 w-3.5 shrink-0 rounded-full bg-accent shadow-glow-accent"
              : "z-10 flex h-3.5 w-3.5 shrink-0 rounded-full border-2 border-border bg-bg-surface-1"
          }
          aria-hidden="true"
        />
        <span className="timeline-connector -mt-0.5 w-px flex-1 bg-border-subtle" aria-hidden="true" />
      </div>
      <div className="flex-1 pb-1">
        <span className="text-label uppercase text-accent">{date}</span>
        <h4 className="mt-1 text-body-lg font-semibold text-text-primary">{title}</h4>
        {children && (
          <div className="prose-reading mt-1.5 text-body-sm text-text-secondary">
            {children}
          </div>
        )}
      </div>
    </AnimatedReveal>
  );
}
