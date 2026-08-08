import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "accent";
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface-1/60 p-6 shadow-sm backdrop-blur-md transition-all duration-base ease-out hover:border-border-strong">
      <p className="text-body-sm text-text-tertiary">{label}</p>
      <p
        className={cn(
          "mt-2 text-heading-2 font-semibold tracking-tight",
          tone === "accent" ? "text-accent" : "text-text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}
