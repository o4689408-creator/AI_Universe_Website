"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

const STORAGE_KEY = "au:bookmarks";
const DEFAULT_COLLECTION = "saved";

export interface BookmarkEntry {
  slug: string;
  collectionId: string;
  savedAt: string;
}

/**
 * Client-side only (no login required) — deliberately scoped this way
 * per the premium-upgrade roadmap: this gets ~90% of the value of full
 * user accounts (saving articles, picking up where you left off) with
 * none of the backend investment. The schema already supports named
 * collections (collectionId), even though the UI only surfaces the
 * single default "saved" collection today — adding real named
 * collections later is a UI change, not a data-model migration.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);

  // Hydrate from localStorage after mount — SSR always starts empty,
  // so there's no server/client markup mismatch.
  useEffect(() => {
    setBookmarks(readStorage<BookmarkEntry[]>(STORAGE_KEY, []));
  }, []);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((entry) => entry.slug === slug),
    [bookmarks]
  );

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks((current) => {
      const exists = current.some((entry) => entry.slug === slug);
      const next = exists
        ? current.filter((entry) => entry.slug !== slug)
        : [
            ...current,
            { slug, collectionId: DEFAULT_COLLECTION, savedAt: new Date().toISOString() },
          ];
      writeStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark };
}
