import type { ReactNode } from "react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

/**
 * A visually distinct "Key Takeaways" summary box — deliberately not
 * just another <Callout>, since a takeaways section is a different
 * reading moment (a scannable recap, usually near the end) than an
 * inline aside. Write a normal markdown list as children; this only
 * supplies the premium framing around it.
 *
 * Usage in MDX:
 *   <KeyTakeaways>
 *   - First takeaway
 *   - Second takeaway
 *   </KeyTakeaways>
 */
export function KeyTakeaways({ children }: { children?: ReactNode }) {
  return (
    <AnimatedReveal variant="scale-in">
      <div className="relative my-8 overflow-hidden rounded-2xl border border-accent/25 bg-bg-surface-1 px-6 py-6 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-accent/[0.14] blur-[80px]"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted text-accent">
            <SparkIcon />
          </span>
          <h3 className="text-body-lg font-semibold text-text-primary">Key Takeaways</h3>
        </div>
        <div className="prose-reading relative mt-3 text-body-sm text-text-secondary [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:font-semibold [&_li]:before:text-accent [&_li]:before:content-['✓'] [&_ul]:mt-0 [&_ul]:list-none [&_ul]:space-y-2.5 [&_ul]:pl-0">
          {children}
        </div>
      </div>
    </AnimatedReveal>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2 9.4 6.6 14 8 9.4 9.4 8 14 6.6 9.4 2 8 6.6 6.6 8 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
