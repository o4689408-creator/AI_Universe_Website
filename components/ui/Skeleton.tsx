import { cn } from "@/lib/utils";

/**
 * A moving gradient sweep (not a flat opacity pulse) — reads as
 * "content is actively loading" rather than "something is broken and
 * blinking," which is the usual criticism of plain pulse skeletons.
 * `bg-size` is 200% so the shimmer keyframe (background-position
 * sweeping from -200% to 200%) has room to travel across and off the
 * element smoothly.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[length:200%_100%] bg-gradient-to-r from-bg-surface-2 via-bg-surface-1 to-bg-surface-2",
        className
      )}
      aria-hidden="true"
    />
  );
}
