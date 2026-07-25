"use client";

import { useBookmarks } from "@/lib/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  slug: string;
  className?: string;
  /** Larger, labeled variant for the article page vs. the compact icon-only card overlay. */
  variant?: "icon" | "labeled";
}

export function BookmarkButton({ slug, className, variant = "icon" }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(slug);

  function handleClick(event: React.MouseEvent) {
    // Cards wrap this in the same clickable area as the article link —
    // stop it from also triggering navigation.
    event.preventDefault();
    event.stopPropagation();
    toggleBookmark(slug);
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-body-sm transition-all duration-fast active:scale-95",
          saved ? "border-accent/40 text-accent" : "text-text-secondary hover:border-border hover:text-text-primary",
          className
        )}
      >
        <BookmarkIcon filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Save article"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-bg-base/70 text-text-primary backdrop-blur-sm transition-all duration-fast ease-out hover:scale-110 active:scale-95",
        saved && "text-accent",
        className
      )}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"}>
      <path
        d="M4 2.5h8a.5.5 0 0 1 .5.5v10.3a.3.3 0 0 1-.46.25L8 10.8l-4.04 2.75a.3.3 0 0 1-.46-.25V3a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
