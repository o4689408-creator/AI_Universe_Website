"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DictionaryEntry {
  word: string;
  phonetic: string | null;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
    example: string | null;
  }[];
}

type Status = "loading" | "success" | "error";

interface PopoverState {
  word: string;
  top: number;
  left: number;
}

const WORD_PATTERN = /^[A-Za-z][A-Za-z'-]{1,29}$/;
const POPOVER_WIDTH = 300;
const VIEWPORT_MARGIN = 12;

/**
 * Finds the exact word under a click/tap point using caret
 * hit-testing — deliberately NOT by wrapping every word in the
 * article in its own <span>. Wrapping would mean thousands of extra
 * DOM nodes for a single long-form article (real cost to layout,
 * paint, and memory), and it also isn't necessary: browsers already
 * expose an API for "what text is at this exact pixel."
 *
 * Uses `caretRangeFromPoint` (Chrome/Safari) with a
 * `caretPositionFromPoint` (Firefox/spec) fallback, then expands left
 * and right from that character offset within the same text node to
 * find the word's boundaries. Returns null for punctuation-only
 * clicks, clicks with no usable API, or clicks landing outside any
 * text node.
 */
function findWordAtPoint(x: number, y: number): { word: string; rect: DOMRect } | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };

  let node: Node | null = null;
  let offset = 0;

  if (typeof document.caretRangeFromPoint === "function") {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;
    node = range.startContainer;
    offset = range.startOffset;
  } else if (typeof doc.caretPositionFromPoint === "function") {
    const position = doc.caretPositionFromPoint(x, y);
    if (!position) return null;
    node = position.offsetNode;
    offset = position.offset;
  } else {
    return null;
  }

  if (!node || node.nodeType !== Node.TEXT_NODE || !node.textContent) return null;

  const text = node.textContent;
  const isWordChar = (char: string) => /[A-Za-z'-]/.test(char);

  if (offset < text.length && !isWordChar(text[offset] ?? "") && offset > 0) {
    offset -= 1;
  }
  if (offset >= text.length || !isWordChar(text[offset] ?? "")) return null;

  let start = offset;
  let end = offset + 1;
  while (start > 0 && isWordChar(text[start - 1] ?? "")) start -= 1;
  while (end < text.length && isWordChar(text[end] ?? "")) end += 1;

  const word = text.slice(start, end).replace(/^['-]+|['-]+$/g, "");
  if (!WORD_PATTERN.test(word)) return null;

  const wordRange = document.createRange();
  wordRange.setStart(node, start);
  wordRange.setEnd(node, end);
  const rect = wordRange.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;

  return { word, rect };
}

/**
 * Wraps article body content. A single click or tap directly on a
 * word shows a compact popup with a one-sentence definition — no
 * drag-to-select gesture required, so it behaves identically on
 * desktop (mouse click) and mobile (tap), which was the actual bug in
 * the previous selection-based implementation: `mouseup`-after-drag
 * doesn't correspond to any single, discoverable mobile gesture.
 */
export function DictionaryPopover({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleClick(event: MouseEvent) {
      // Don't hijack real interactive elements (links, buttons, the
      // popover card itself, inline code).
      const target = event.target as HTMLElement;
      if (target.closest("a, button, code, pre, #dictionary-popover-card")) return;

      const hit = findWordAtPoint(event.clientX, event.clientY);
      if (!hit) return;

      const idealLeft = hit.rect.left + hit.rect.width / 2 + window.scrollX;
      const clampedLeft = Math.min(
        Math.max(idealLeft, VIEWPORT_MARGIN + POPOVER_WIDTH / 2),
        window.innerWidth + window.scrollX - VIEWPORT_MARGIN - POPOVER_WIDTH / 2
      );

      setPopover({
        word: hit.word,
        top: hit.rect.bottom + window.scrollY + 10,
        left: clampedLeft,
      });
    }

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!popover) return;

    let cancelled = false;
    setStatus("loading");
    setError(null);
    setEntry(null);

    fetch(`/api/dictionary?word=${encodeURIComponent(popover.word)}&lang=en`)
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ?? "No definition found.");
          setStatus("error");
          return;
        }
        setEntry(data);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't look that up right now.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [popover]);

  useEffect(() => {
    if (!popover) return;
    function handleClickAway(event: MouseEvent) {
      const card = document.getElementById("dictionary-popover-card");
      if (card && !card.contains(event.target as Node)) setPopover(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPopover(null);
    }
    function handleScroll() {
      setPopover(null);
    }
    // Click-away listens on the next tick — otherwise the very click
    // that opened the popover (which bubbles to document) would
    // immediately close it again.
    const id = setTimeout(() => {
      document.addEventListener("click", handleClickAway);
    }, 0);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handleClickAway);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [popover]);

  const primaryMeaning = entry?.meanings[0];
  const primaryDefinition = primaryMeaning?.definitions[0];

  return (
    <div ref={containerRef} className="relative [&_*]:cursor-text">
      {children}

      {popover && (
        <div
          id="dictionary-popover-card"
          role="dialog"
          aria-label={`Definition of ${popover.word}`}
          style={{ top: popover.top, left: popover.left }}
          className="absolute z-50 w-[calc(100vw-24px)] max-w-[300px] -translate-x-1/2 animate-pop-in overflow-hidden rounded-2xl border border-accent/25 bg-bg-surface-1/95 shadow-[var(--shadow-lg),var(--shadow-glow-accent)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold capitalize text-text-primary">
                {popover.word}
              </p>
              {primaryMeaning?.partOfSpeech && (
                <p className="text-label italic text-text-tertiary">{primaryMeaning.partOfSpeech}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setPopover(null)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-tertiary transition-colors duration-fast hover:bg-bg-surface-2 hover:text-text-primary"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="px-4 py-3.5">
            {status === "loading" && (
              <div className="flex items-center gap-2 text-body-sm text-text-tertiary">
                <Spinner />
                Looking it up…
              </div>
            )}
            {status === "error" && <p className="text-body-sm text-text-tertiary">{error}</p>}
            {status === "success" && primaryDefinition && (
              <div className="flex flex-col gap-1.5">
                <p className="text-body-sm leading-snug text-text-primary">{primaryDefinition}</p>
                {primaryMeaning?.example && (
                  <p className="text-label italic text-text-tertiary">
                    &ldquo;{primaryMeaning.example}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.6" />
      <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
