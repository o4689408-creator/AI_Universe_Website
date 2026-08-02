import type { ReactNode } from "react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

interface PullQuoteProps {
  children: ReactNode;
  /** e.g. "Sam Altman, CEO of OpenAI" — renders as a small attribution line below the quote. */
  attribution?: string;
}

export function PullQuote({ children, attribution }: PullQuoteProps) {
  return (
    <AnimatedReveal>
      <figure className="my-8 rounded-r-lg border-l-2 border-accent bg-bg-surface-1/60 py-5 pl-6 pr-5">
        <blockquote className="text-heading-4 italic text-text-primary">
          {children}
        </blockquote>
        {attribution && (
          <figcaption className="mt-3 text-body-sm not-italic text-text-tertiary">
            — {attribution}
          </figcaption>
        )}
      </figure>
    </AnimatedReveal>
  );
}
