import { cn } from "@/lib/utils";

type BadgeTone = "success" | "neutral" | "accent" | "warning";

const toneStyles: Record<BadgeTone, string> = {
  success: "bg-success/10 text-success border-success/20",
  neutral: "bg-bg-surface-2 text-text-secondary border-border-subtle",
  accent: "bg-accent/10 text-accent border-accent/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-label font-medium uppercase tracking-wide",
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  );
}
