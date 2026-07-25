import { clsx, type ClassValue } from "clsx";

/**
 * Composes className strings conditionally. Kept as a thin wrapper
 * around clsx (no tailwind-merge) — the design system's classes rarely
 * conflict since components don't accept arbitrary Tailwind overrides
 * from callers. If that changes later, tailwind-merge is a one-line
 * addition here without touching call sites.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
