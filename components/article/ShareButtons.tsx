"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";

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
 */
export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const handleRipple = useRipple();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

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
    "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle text-text-secondary " +
    "transition-all duration-base ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:scale-95";

  return (
    <div className="flex items-center gap-3">
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
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        onPointerDown={handleRipple}
        className={cn(baseButton, "hover:border-transparent hover:bg-[#1877F2] hover:text-white")}
      >
        <FacebookIcon />
      </a>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        onPointerDown={handleRipple}
        className={cn(baseButton, "hover:border-transparent hover:bg-[#25D366] hover:text-white")}
      >
        <WhatsAppIcon />
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

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M9.5 4.8h1.7V2.1h-1.9C7.6 2.1 6.5 3.3 6.5 5v1.6H5v2.6h1.5V14h2.6V9.2h1.7l.4-2.6H9.1V5.3c0-.3.2-.5.4-.5Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2a6 6 0 0 0-5.2 9L2 14l3.1-.8A6 6 0 1 0 8 2Zm0 1.2a4.8 4.8 0 0 1 4 7.4l-.2.3.5 1.8-1.9-.5-.3.2A4.8 4.8 0 1 1 8 3.2Zm-2.2 2c-.1 0-.3 0-.4.2-.2.2-.6.6-.6 1.4s.6 1.7.7 1.8c.1.1 1.2 1.9 3 2.6 1.4.6 1.7.5 2 .4.4 0 1.1-.4 1.3-.9.2-.4.2-.8.1-.9-.1-.1-.2-.2-.4-.3l-1.2-.6c-.2 0-.3-.1-.4.1l-.5.7c-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-1-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.2-.4v-.4l-.5-1.3c-.1-.4-.3-.3-.4-.3Z" />
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
