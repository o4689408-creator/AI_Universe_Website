"use client";

import { useMemo, useState } from "react";

export interface LinkableTopic {
  title: string;
  slug: string;
}

export function InternalLinkAssistant({
  topics,
  onInsert,
}: {
  topics: LinkableTopic[];
  onInsert: (markdownLink: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? topics.filter((t) => t.title.toLowerCase().includes(q)) : topics;
    return base.slice(0, 8);
  }, [topics, query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-border-subtle px-2.5 py-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path d="M6.5 9.5 9.5 6.5M6.7 4.3l.9-.9a2.5 2.5 0 0 1 3.5 3.5l-.9.9M9.3 11.7l-.9.9a2.5 2.5 0 0 1-3.5-3.5l.9-.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        Link an article
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-72 rounded-lg border border-border-subtle bg-bg-surface-1 p-2 shadow-lg backdrop-blur-md">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-md border border-border-subtle bg-bg-surface-2 px-2.5 py-1.5 text-body-sm text-text-primary outline-none focus:border-accent"
          />
          <div className="mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-body-sm text-text-tertiary">No matches.</p>
            ) : (
              filtered.map((topic) => (
                <button
                  key={topic.slug}
                  type="button"
                  onClick={() => {
                    onInsert(`[${topic.title}](/topics/${topic.slug})`);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="truncate rounded px-2.5 py-1.5 text-left text-body-sm text-text-secondary transition-colors duration-fast hover:bg-bg-surface-2 hover:text-text-primary"
                >
                  {topic.title}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
