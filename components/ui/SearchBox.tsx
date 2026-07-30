"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { highlightMatch, searchAll, type CombinedSearchResult } from "@/lib/search";
import type { TopicMeta, Video } from "@/types/content";

interface SearchBoxProps {
  topics: TopicMeta[];
  videos?: Video[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  maxResults?: number;
}

function resultHref(result: CombinedSearchResult): string {
  if (result.type === "topic") return `/topics/${result.topic.slug}`;
  return result.video.companionTopicSlug
    ? `/topics/${result.video.companionTopicSlug}`
    : `/videos/${result.video.slug}`;
}

function resultKey(result: CombinedSearchResult): string {
  return result.type === "topic" ? `topic-${result.topic.slug}` : `video-${result.video.id}`;
}

/**
 * Instant, client-side article + video search with a results dropdown.
 *
 * "Instant" here means what it sounds like: filtering an in-memory
 * array of plain objects on every keystroke, no debounce needed. This
 * stays genuinely instant up to at least a few thousand articles —
 * see EDITOR_GUIDE.md for the honest note on when this approach (and
 * the Cmd+K index) will eventually want pagination instead.
 */
export function SearchBox({
  topics,
  videos = [],
  placeholder = "Search articles, topics, tags, authors, or videos…",
  className,
  autoFocus = false,
  maxResults = 8,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => searchAll(topics, videos, query).slice(0, maxResults),
    [topics, videos, query, maxResults]
  );

  const showDropdown = isOpen && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function navigateTo(href: string) {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  }

  function closeAndBlur() {
    setIsOpen(false);
    setQuery("");
    // Escape can be pressed while focus is on the input OR on one of the
    // dropdown result buttons (e.g. after tabbing down into the list) —
    // blurring document.activeElement covers both, rather than only the
    // input that originally received the keydown.
    (document.activeElement as HTMLElement | null)?.blur();
  }

  // Attached to the wrapper div (not just the input) so Escape/Arrow
  // keys work no matter which focusable element inside the search box
  // currently has focus — including after tabbing into a result button.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndBlur();
      return;
    }

    if (!showDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const result = results[activeIndex];
      if (result) navigateTo(resultHref(result));
    }
  }

  return (
    <div
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      className={cn("relative w-full", className)}
    >
      <div className="flex items-center gap-3 rounded-md border border-border bg-bg-surface-1 px-4 py-3 focus-within:border-accent">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-box-results"
          aria-autocomplete="list"
          className="w-full flex-1 bg-transparent text-body-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="text-text-tertiary transition-colors duration-fast hover:text-text-primary"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="search-box-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-border bg-bg-surface-1 shadow-lg"
        >
          {results.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <ul className="max-h-96 overflow-y-auto p-2">
              {results.map((result, index) => (
                <li key={resultKey(result)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onClick={() => navigateTo(resultHref(result))}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-md px-3 py-2.5 text-left transition-colors duration-fast",
                      index === activeIndex ? "bg-accent-muted" : "hover:bg-bg-surface-2"
                    )}
                  >
                    <span
                      className={cn(
                        "text-body-sm font-medium",
                        index === activeIndex ? "text-accent" : "text-text-primary"
                      )}
                    >
                      {highlightMatch(
                        result.type === "topic" ? result.topic.title : result.video.title,
                        query
                      )}
                    </span>
                    <span className="line-clamp-1 text-body-sm text-text-tertiary">
                      {result.type === "topic" ? (
                        <>
                          {highlightMatch(result.topic.category, query)}
                          {" · "}
                          {highlightMatch(result.topic.author.name, query)}
                        </>
                      ) : (
                        "Video"
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface-2 text-text-tertiary">
        <SearchIcon />
      </div>
      <p className="text-body-sm font-medium text-text-primary">
        No results found for &ldquo;{query}&rdquo;
      </p>
      <p className="text-body-sm text-text-tertiary">
        Try a different title, topic, tag, author, or video.
      </p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-text-tertiary">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
