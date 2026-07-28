"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DictionaryEntry {
  word: string;
  phonetic: string | null;
  audioUrl: string | null;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
    synonyms: string[];
    example: string | null;
  }[];
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "hi", label: "Hindi" },
];

type Status = "idle" | "loading" | "success" | "error";

interface PopoverState {
  word: string;
  top: number;
  left: number;
}

/**
 * Wraps article body content. Listens for the reader selecting a
 * single word (mouseup within the wrapped region) and shows a floating
 * card with its definition, pronunciation, synonyms, an example
 * sentence, and a language selector — powered by
 * app/api/dictionary/route.ts.
 *
 * Deliberately word-only (not phrase lookup): selecting multiple words
 * or clicking without selecting anything just does nothing, rather
 * than guessing at partial matches.
 */
export function DictionaryPopover({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState<Status>("idle");
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleMouseUp() {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";

      if (!text || !/^[a-zA-Z'-]{2,30}$/.test(text)) {
        return;
      }
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const anchorNode = range.commonAncestorContainer;
      if (!container || !container.contains(anchorNode)) return;

      const rect = range.getBoundingClientRect();
      setPopover({
        word: text,
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }

    container.addEventListener("mouseup", handleMouseUp);
    return () => container.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    if (!popover) return;

    let cancelled = false;
    setStatus("loading");
    setError(null);
    setEntry(null);

    fetch(`/api/dictionary?word=${encodeURIComponent(popover.word)}&lang=${lang}`)
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
          setError("Something went wrong looking that up.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [popover, lang]);

  useEffect(() => {
    if (!popover) return;
    function handleClickAway(event: MouseEvent) {
      const card = document.getElementById("dictionary-popover-card");
      if (card && !card.contains(event.target as Node)) {
        setPopover(null);
      }
    }
    function handleScroll() {
      setPopover(null);
    }
    document.addEventListener("mousedown", handleClickAway);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [popover]);

  return (
    <div ref={containerRef} className="relative">
      {children}

      {popover && (
        <div
          id="dictionary-popover-card"
          role="dialog"
          aria-label={`Definition of ${popover.word}`}
          style={{ top: popover.top, left: popover.left }}
          className="absolute z-50 w-[280px] -translate-x-1/2 rounded-xl border border-border bg-bg-surface-1 p-4 shadow-lg animate-fade-up sm:w-80"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-body-sm font-semibold capitalize text-text-primary">
                {popover.word}
              </p>
              {entry?.phonetic && (
                <p className="text-label text-text-tertiary">{entry.phonetic}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {entry?.audioUrl && (
                <button
                  type="button"
                  aria-label="Play pronunciation"
                  onClick={() => new Audio(entry.audioUrl!).play().catch(() => undefined)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors duration-fast hover:text-accent"
                >
                  <SpeakerIcon />
                </button>
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPopover(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors duration-fast hover:text-text-primary"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {LANGUAGES.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => setLang(option.code)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-label transition-colors duration-fast",
                  lang === option.code
                    ? "bg-accent-muted text-accent"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto pr-1">
            {status === "loading" && (
              <p className="text-body-sm text-text-tertiary">Looking it up…</p>
            )}
            {status === "error" && (
              <p className="text-body-sm text-text-tertiary">{error}</p>
            )}
            {status === "success" && entry && (
              <div className="flex flex-col gap-3">
                {entry.meanings.slice(0, 3).map((meaning, index) => (
                  <div key={`${meaning.partOfSpeech}-${index}`}>
                    <p className="text-label uppercase text-text-tertiary">
                      {meaning.partOfSpeech}
                    </p>
                    <ol className="mt-1 list-decimal space-y-1 pl-4 text-body-sm text-text-secondary">
                      {meaning.definitions.map((definition, defIndex) => (
                        <li key={defIndex}>{definition}</li>
                      ))}
                    </ol>
                    {meaning.example && (
                      <p className="mt-1 text-body-sm italic text-text-tertiary">
                        &ldquo;{meaning.example}&rdquo;
                      </p>
                    )}
                    {meaning.synonyms.length > 0 && (
                      <p className="mt-1 text-body-sm text-text-tertiary">
                        <span className="text-text-secondary">Synonyms: </span>
                        {meaning.synonyms.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
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

function SpeakerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M2 6h2.5L8 3v10L4.5 10H2V6Z" />
      <path
        d="M10.5 5.5a3.5 3.5 0 0 1 0 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
