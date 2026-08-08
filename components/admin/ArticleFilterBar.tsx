"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ArticleFilterBar({
  categories,
  tags,
}: {
  categories: string[];
  tags: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // any filter change resets to page 1
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  // Debounced search — one navigation per pause in typing, not per keystroke.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;
    const timeout = setTimeout(() => updateParam("q", query), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const selectClasses =
    "rounded-md border border-border-subtle bg-bg-surface-1 px-3 py-2 text-body-sm text-text-primary outline-none transition-colors duration-fast focus:border-accent";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search title, subtitle, slug…"
        className="min-w-[220px] flex-1 rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2 text-body-sm text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
      />

      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className={selectClasses}
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="ready">Ready</option>
        <option value="scheduled">Scheduled</option>
        <option value="published">Published</option>
      </select>

      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className={selectClasses}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("tag") ?? ""}
        onChange={(e) => updateParam("tag", e.target.value)}
        className={selectClasses}
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-body-sm text-text-secondary">
        <input
          type="checkbox"
          checked={searchParams.get("featured") === "true"}
          onChange={(e) => updateParam("featured", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-border-subtle text-accent focus:ring-accent"
        />
        Featured
      </label>
      <label className="flex items-center gap-1.5 text-body-sm text-text-secondary">
        <input
          type="checkbox"
          checked={searchParams.get("trending") === "true"}
          onChange={(e) => updateParam("trending", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-border-subtle text-accent focus:ring-accent"
        />
        Trending
      </label>

      {(searchParams.toString().length > 0) && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="text-body-sm font-medium text-text-tertiary transition-colors duration-fast hover:text-text-primary"
        >
          Clear
        </button>
      )}
    </div>
  );
}
