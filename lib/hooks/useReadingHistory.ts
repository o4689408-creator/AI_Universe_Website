"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

const STORAGE_KEY = "au:reading-history";
const MAX_ENTRIES = 20;

export interface HistoryEntry {
  slug: string;
  viewedAt: string;
}

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readStorage<HistoryEntry[]>(STORAGE_KEY, []));
  }, []);

  /** Records a view, moving it to the front if already present, capped at MAX_ENTRIES. */
  const recordView = useCallback((slug: string) => {
    setHistory((current) => {
      const withoutSlug = current.filter((entry) => entry.slug !== slug);
      const next = [{ slug, viewedAt: new Date().toISOString() }, ...withoutSlug].slice(
        0,
        MAX_ENTRIES
      );
      writeStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeStorage(STORAGE_KEY, []);
  }, []);

  return { history, recordView, clearHistory };
}
