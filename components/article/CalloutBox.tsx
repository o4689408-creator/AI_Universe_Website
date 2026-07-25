"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

type CalloutVariant = "default" | "note" | "tip" | "warning" | "info";

interface CalloutBoxProps {
  title?: string;
  variant?: CalloutVariant;
  children?: ReactNode;
}

const variantStyles: Record<
  Exclude<CalloutVariant, "default">,
  { border: string; iconColor: string; defaultTitle: string; icon: ReactNode }
> = {
  note: {
    border: "border-border",
    iconColor: "text-text-tertiary",
    defaultTitle: "Note",
    icon: <NoteIcon />,
  },
  tip: {
    border: "border-success/40",
    iconColor: "text-success",
    defaultTitle: "Tip",
    icon: <TipIcon />,
  },
  warning: {
    border: "border-warning/40",
    iconColor: "text-warning",
    defaultTitle: "Warning",
    icon: <WarningIcon />,
  },
  info: {
    border: "border-accent/40",
    iconColor: "text-accent",
    defaultTitle: "Information",
    icon: <InfoIcon />,
  },
};

/**
 * Two distinct behaviors depending on variant:
 * - "default" (no variant given): the original collapsible "Go deeper"
 *   technical-depth box — collapsed until clicked, so casual readers
 *   aren't intimidated.
 * - "note" / "tip" / "warning" / "info": always-visible callouts with
 *   a colored left accent and icon — these are meant to be seen
 *   immediately, not hidden behind a toggle.
 *
 * Usage in MDX:
 *   <Callout>Go-deeper content</Callout>
 *   <Callout variant="tip">A quick tip</Callout>
 *   <Callout variant="warning" title="Careful">Custom title</Callout>
 */
export function CalloutBox({ title, variant = "default", children }: CalloutBoxProps) {
  const [open, setOpen] = useState(false);

  if (variant === "default") {
    return (
      <AnimatedReveal className="my-6 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-1">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="text-body-sm font-medium text-text-primary">
            {title ?? "Go deeper"}
          </span>
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

  const styles = variantStyles[variant];

  return (
    <AnimatedReveal
      className={cn(
        "my-6 flex gap-3 rounded-lg border bg-bg-surface-1 px-5 py-4",
        styles.border
      )}
    >
      <span className={cn("mt-0.5 shrink-0", styles.iconColor)} aria-hidden="true">
        {styles.icon}
      </span>
      <div>
        <p className={cn("text-body-sm font-medium", styles.iconColor)}>
          {title ?? styles.defaultTitle}
        </p>
        <div className="prose-reading mt-1 text-body-sm text-text-secondary">
          {children}
        </div>
      </div>
    </AnimatedReveal>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
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

function NoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.5 6.5h5M5.5 9h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2a4 4 0 0 0-2.3 7.3c.3.2.3.5.3.7v.5h4v-.5c0-.2 0-.5.3-.7A4 4 0 0 0 8 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M6.5 13h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2.5 14 13H2L8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5.2" r="0.75" fill="currentColor" />
    </svg>
  );
}
