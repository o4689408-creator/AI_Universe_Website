"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

/**
 * A collapsible FAQ list for the end of an article.
 *
 * Usage in MDX:
 *   <FAQSection>
 *     <FAQItem question="Is GPT-5.6 available to everyone?">
 *       Answer text.
 *     </FAQItem>
 *   </FAQSection>
 *
 * Each item manages its own open/closed state independently (not an
 * accordion that closes siblings) — readers scanning several
 * questions shouldn't lose their place because opening one closed
 * another.
 */
export function FAQSection({ children }: { children?: ReactNode }) {
  return (
    <div className="my-8 flex flex-col gap-3">{children}</div>
  );
}

export function FAQItem({ question, children }: { question: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AnimatedReveal
      variant="reading"
      className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-1"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-fast hover:bg-bg-surface-2/60"
      >
        <span className="text-body-lg font-medium text-text-primary">{question}</span>
        <ChevronIcon open={open} />
      </button>

      <div
        className={cn(
          "grid transition-all duration-base ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="prose-reading border-t border-border-subtle px-5 py-4 text-body-sm text-text-secondary">
            {children}
          </div>
        </div>
      </div>
    </AnimatedReveal>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        "shrink-0 text-text-tertiary transition-transform duration-base ease-out",
        open && "rotate-180"
      )}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
