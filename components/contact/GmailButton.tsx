"use client";

import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";
import { GMAIL_DEFAULT_BODY, GMAIL_DEFAULT_SUBJECT, buildMailtoLink } from "@/lib/config";

type GmailButtonVariant = "floating" | "compact" | "cta";

interface GmailButtonProps {
  variant?: GmailButtonVariant;
  className?: string;
}

/**
 * A single component powers every "email us" entry point on the site
 * (floating FAB, footer compact link, Contact page CTA) so the
 * subject/body text only ever come from lib/config.ts. Uses a plain
 * `mailto:` link — no external service, no API key, and it opens
 * whatever mail app the visitor already has set as default (Gmail,
 * Outlook, Apple Mail, etc.), which is what "open Gmail" means for a
 * link clicked in a browser.
 */
export function GmailButton({ variant = "floating", className }: GmailButtonProps) {
  const handleRipple = useRipple();
  const href = buildMailtoLink(undefined, GMAIL_DEFAULT_SUBJECT, GMAIL_DEFAULT_BODY);

  if (variant === "floating") {
    return (
      <a
        href={href}
        onPointerDown={handleRipple}
        aria-label="Email the AI Universe team"
        className={cn(
          "group fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-hover text-bg-base shadow-glow-accent shadow-lg",
          "transition-transform duration-base ease-out hover:scale-110 active:scale-95",
          "sm:bottom-6 sm:right-6",
          className
        )}
      >
        <GmailIcon className="relative h-6 w-6" />
      </a>
    );
  }

  if (variant === "cta") {
    return (
      <a
        href={href}
        onPointerDown={handleRipple}
        className={cn(
          "relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-md bg-gradient-to-br from-accent to-accent-hover px-5 py-4 text-body font-medium text-bg-base",
          "transition-transform duration-base ease-out hover:scale-[1.03] hover:shadow-glow-accent active:scale-[0.97]",
          className
        )}
      >
        <GmailIcon className="h-5 w-5" />
        Email us on Gmail
      </a>
    );
  }

  return (
    <a
      href={href}
      onPointerDown={handleRipple}
      className={cn(
        "relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-md text-body-sm text-text-secondary",
        "transition-colors duration-fast hover:text-accent",
        className
      )}
    >
      <GmailIcon className="h-4 w-4" />
      Email us
    </a>
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
