import type { ReactNode } from "react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { cn } from "@/lib/utils";

interface BoxProps {
  children?: ReactNode;
  title?: string;
}

/**
 * Four small, visually distinct "reader engagement" boxes — each one
 * a different accent color and icon so a reader scanning the article
 * can immediately tell them apart at a glance, rather than four boxes
 * that all look like variations of the same Callout.
 */

export function QuickSummary({ children, title = "Quick Summary" }: BoxProps) {
  return (
    <EngagementBox icon="📋" accent="accent" title={title}>
      {children}
    </EngagementBox>
  );
}

export function DidYouKnow({ children, title = "Did You Know?" }: BoxProps) {
  return (
    <EngagementBox icon="💡" accent="warning" title={title}>
      {children}
    </EngagementBox>
  );
}

export function ReaderChallenge({ children, title = "Reader Challenge" }: BoxProps) {
  return (
    <EngagementBox icon="🔥" accent="error" title={title}>
      {children}
    </EngagementBox>
  );
}

export function PredictionCard({ children, title = "What Happens Next?" }: BoxProps) {
  return (
    <EngagementBox icon="🔮" accent="success" title={title}>
      {children}
    </EngagementBox>
  );
}

const accentClasses = {
  accent: {
    border: "border-accent/25",
    iconBg: "bg-accent-muted",
    glow: "bg-accent/[0.14]",
  },
  warning: {
    border: "border-[#FFC24C]/30",
    iconBg: "bg-[#FFC24C]/15",
    glow: "bg-[#FFC24C]/[0.14]",
  },
  error: {
    border: "border-error/25",
    iconBg: "bg-error/10",
    glow: "bg-error/[0.12]",
  },
  success: {
    border: "border-success/25",
    iconBg: "bg-success/10",
    glow: "bg-success/[0.12]",
  },
} as const;

function EngagementBox({
  children,
  title,
  icon,
  accent,
}: {
  children?: ReactNode;
  title: string;
  icon: string;
  accent: keyof typeof accentClasses;
}) {
  const classes = accentClasses[accent];
  return (
    <AnimatedReveal variant="scale-in">
      <div
        className={cn(
          "relative my-8 overflow-hidden rounded-2xl border bg-bg-surface-1 px-6 py-5 sm:px-7",
          classes.border
        )}
      >
        <div
          className={cn("pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-[60px]", classes.glow)}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5">
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-body-sm", classes.iconBg)}>
            {icon}
          </span>
          <h4 className="text-body-lg font-semibold text-text-primary">{title}</h4>
        </div>
        <div className="prose-reading relative mt-2.5 text-body-sm text-text-secondary">{children}</div>
      </div>
    </AnimatedReveal>
  );
}
