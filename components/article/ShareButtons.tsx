"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";
import { buildMailtoLink } from "@/lib/config";

interface ShareButtonsProps {
  url: string;
  title: string;
}

/**
 * Real share-intent URLs only. YouTube and Instagram are deliberately
 * NOT included here — neither has a "share a link to this article" web
 * intent (Instagram has no web share API; YouTube isn't a link-sharing
 * destination). Building fake buttons for those would look identical
 * to real ones but silently do nothing useful — worse than not having
 * them. YouTube/Instagram belong as "follow us" links (e.g. footer),
 * a different feature from "share this article."
 *
 * `flex-wrap` on the row (rather than a fixed single line) is
 * deliberate: on narrow Android widths five 44px touch targets plus
 * the "Share" label can exceed the available width, and wrapping to a
 * second line reads far better than horizontal overflow/clipping.
 */
export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const handleRipple = useRipple();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const gmailHref = buildMailtoLink(undefined, title, `${title}\n\n${url}`);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently, links remain usable.
    }
  }

  const baseButton =
    "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border-subtle text-text-secondary " +
    "transition-all duration-base ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:scale-95";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-body-sm text-text-tertiary">Share</span>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        onPointerDown={handleRipple}
        className={cn(baseButton, "hover:border-transparent hover:bg-text-primary hover:text-bg-base")}
      >
        <XIcon />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        onPointerDown={handleRipple}
        className={cn(baseButton, "hover:border-transparent hover:bg-[#0A66C2] hover:text-white")}
      >
        <LinkedInIcon />
      </a>

      <a
        href={gmailHref}
        aria-label="Share via Gmail"
        onPointerDown={handleRipple}
        className={cn(baseButton, "hover:border-transparent hover:bg-white")}
      >
        <GmailIcon className="h-5 w-5" />
      </a>

      <button
        type="button"
        onClick={handleCopy}
        onPointerDown={handleRipple}
        aria-label="Copy link"
        className={cn(baseButton, "hover:border-transparent hover:bg-accent hover:text-bg-base")}
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        {copied && (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-bg-surface-2 px-2 py-1 text-label text-text-primary shadow-md animate-fade-up">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.6 1.5h2.05l-4.48 5.12L15.5 14.5h-4.13l-3.23-4.22-3.7 4.22H2.4l4.79-5.48L1.5 1.5h4.24l2.92 3.86 3.94-3.86Zm-.72 11.77h1.13L4.7 2.66H3.5l8.38 10.61Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.6 5.6h2.3V13H3.6V5.6ZM4.75 2.5a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7ZM7.4 5.6h2.2v1h.03c.3-.58 1.06-1.2 2.18-1.2 2.33 0 2.76 1.53 2.76 3.52V13h-2.3V9.35c0-.87-.02-2-1.22-2s-1.4.95-1.4 1.93V13H7.4V5.6Z" />
    </svg>
  );
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 36" className={className} aria-hidden="true">
      <rect width="48" height="36" rx="6" fill="#FFFFFF" />
      <path fill="#4285F4" d="M6 9v21a3 3 0 0 0 3 3h3V13.6L6 9Z" />
      <path fill="#34A853" d="M36 33h3a3 3 0 0 0 3-3V9l-6 4.6V33Z" />
      <path fill="#EA4335" d="M6 9l18 13.5L42 9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M6.5 9.5L9.5 6.5M7 4.5L7.7 3.8a2.5 2.5 0 0 1 3.5 3.5l-.7.7M9 11.5l-.7.7a2.5 2.5 0 0 1-3.5-3.5l.7-.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
