"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TopicMeta, Video } from "@/types/content";
import { cn } from "@/lib/utils";
import { highlightMatch, searchTopics, searchVideos } from "@/lib/search";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  topics: TopicMeta[];
  videos?: Video[];
}

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: "nav-home", label: "Home", href: "/" },
  { id: "nav-topics", label: "Topics", href: "/topics" },
  { id: "nav-videos", label: "Videos", href: "/videos" },
  { id: "nav-about", label: "About", href: "/about" },
];

interface PaletteOption {
  id: string;
  href: string;
  group: "Navigate" | "Topics" | "Videos";
  render: (isActive: boolean, query: string) => React.ReactNode;
}

export function CommandPalette({ open, onClose, topics, videos = [] }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Shared search engine (lib/search.ts) — the exact same matching and
  // ranking logic SearchBox uses, so Cmd+K and the on-page search on
  // /topics never behave differently for the same query.
  const topicResults = useMemo(() => searchTopics(topics, query), [topics, query]);
  const videoResults = useMemo(() => searchVideos(videos, query), [videos, query]);

  const matchingNavItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  const options: PaletteOption[] = useMemo(() => {
    const navOptions: PaletteOption[] = matchingNavItems.map((item) => ({
      id: item.id,
      href: item.href,
      group: "Navigate" as const,
      render: (isActive) => (
        <span className={cn("text-body-sm", isActive ? "text-accent" : "text-text-primary")}>
          {item.label}
        </span>
      ),
    }));

    const topicOptions: PaletteOption[] = topicResults.map(({ topic }) => ({
      id: `topic-${topic.slug}`,
      href: `/topics/${topic.slug}`,
      group: "Topics" as const,
      render: (isActive, q) => (
        <>
          <span className={cn("text-body-sm", isActive ? "text-accent" : "text-text-primary")}>
            {highlightMatch(topic.title, q)}
          </span>
          <span className="text-body-sm text-text-tertiary">
            {highlightMatch(topic.category, q)}
          </span>
        </>
      ),
    }));

    const videoOptions: PaletteOption[] = videoResults.map(({ video }) => ({
      id: `video-${video.id}`,
      href: video.companionTopicSlug
        ? `/topics/${video.companionTopicSlug}`
        : `/videos/${video.slug}`,
      group: "Videos" as const,
      render: (isActive, q) => (
        <>
          <span className={cn("text-body-sm", isActive ? "text-accent" : "text-text-primary")}>
            {highlightMatch(video.title, q)}
          </span>
          <span className="text-body-sm text-text-tertiary">Video</span>
        </>
      ),
    }));

    // Without a query, show quick nav only (topics browsed via /topics).
    // With a query, show whichever groups actually matched.
    return query.trim() ? [...navOptions, ...topicOptions, ...videoOptions] : navOptions;
  }, [matchingNavItems, topicResults, videoResults, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === "Enter") {
        const option = options[activeIndex];
        if (option) {
          router.push(option.href);
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, options, activeIndex, router, onClose]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search AI Universe"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-bg-surface-1 shadow-lg"
      >
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles, videos, or jump to a page…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            className="flex-1 bg-transparent text-body-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded border border-border-subtle px-1.5 py-0.5 text-label text-text-tertiary transition-colors duration-fast hover:border-border hover:text-text-primary"
          >
            Esc
          </button>
        </div>

        <div id="command-palette-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {options.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <p className="text-body-sm font-medium text-text-primary">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-body-sm text-text-tertiary">
                Try a different title, topic, tag, author, or video.
              </p>
            </div>
          )}

          {(["Navigate", "Topics", "Videos"] as const).map((group) => {
            const groupOptions = options.filter((option) => option.group === group);
            if (groupOptions.length === 0) return null;

            return (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 text-label uppercase text-text-tertiary">{group}</p>
                {groupOptions.map((option) => {
                  runningIndex += 1;
                  const isActive = runningIndex === activeIndex;
                  return (
                    <button
                      key={option.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        router.push(option.href);
                        onClose();
                      }}
                      onMouseEnter={() => setActiveIndex(runningIndex)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors duration-fast",
                        isActive ? "bg-accent-muted" : "hover:bg-bg-surface-2"
                      )}
                    >
                      {option.render(isActive, query)}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
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
