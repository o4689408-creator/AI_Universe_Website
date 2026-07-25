"use client";

import { cn } from "@/lib/utils";
import type { Interest } from "@/lib/recommendations";

interface InterestPickerProps {
  interests: Interest[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function InterestPicker({ interests, selectedIds, onToggle }: InterestPickerProps) {
  return (
    <div
      role="group"
      aria-label="Select your AI interests"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
    >
      {interests.map((interest) => {
        const isSelected = selectedIds.includes(interest.id);
        return (
          <button
            key={interest.id}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => onToggle(interest.id)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-lg border px-4 py-4 text-left transition-all duration-base ease-out",
              isSelected
                ? "border-accent bg-accent-muted"
                : "border-border-subtle bg-bg-surface-1 hover:-translate-y-0.5 hover:border-border"
            )}
          >
            <span
              className={cn(
                "text-body-sm font-medium transition-colors duration-fast",
                isSelected ? "text-accent" : "text-text-primary"
              )}
            >
              {interest.label}
            </span>
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-fast",
                isSelected
                  ? "border-accent bg-accent"
                  : "border-border-subtle bg-transparent group-hover:border-border"
              )}
              aria-hidden="true"
            >
              {isSelected && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.5L4.8 8.8L9.5 3.5"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
