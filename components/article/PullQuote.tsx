import type { ReactNode } from "react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <AnimatedReveal>
      <blockquote className="my-8 border-l-2 border-accent pl-6 text-heading-4 italic text-text-primary">
        {children}
      </blockquote>
    </AnimatedReveal>
  );
}
