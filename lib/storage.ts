/**
 * Thin, safe localStorage wrapper.
 *
 * Every read/write is guarded: `window` doesn't exist during server
 * rendering, and localStorage can throw in private-browsing modes or
 * when storage is full — callers never need to think about either
 * case. Returns sensible fallbacks (null/false) rather than throwing,
 * since none of this data is critical (bookmarks/history are a
 * convenience, not something to break the page over).
 */

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
