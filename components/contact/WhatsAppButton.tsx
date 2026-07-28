"use client";

import { usePathname } from "next/navigation";
import { useRipple } from "@/lib/hooks/useRipple";
import { cn } from "@/lib/utils";
import { SITE_URL, WHATSAPP_DEFAULT_MESSAGE, buildWhatsAppLink } from "@/lib/config";

type WhatsAppButtonVariant = "floating" | "compact" | "cta";

interface WhatsAppButtonProps {
  variant?: WhatsAppButtonVariant;
  className?: string;
}

/**
 * A single component powers every WhatsApp entry point on the site
 * (floating FAB, footer compact link, Contact page CTA) so the
 * message text and number only ever come from lib/config.ts. The
 * current page's URL is appended to the greeting automatically at
 * click time — the team always knows which page a lead came from
 * without needing UTM params or extra tracking.
 */
export function WhatsAppButton({ variant = "floating", className }: WhatsAppButtonProps) {
  const pathname = usePathname();
  const handleRipple = useRipple();

  const pageUrl = `${SITE_URL}${pathname ?? "/"}`;
  const message = `${WHATSAPP_DEFAULT_MESSAGE}\n${pageUrl}`;
  const href = buildWhatsAppLink(message);

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={handleRipple}
        aria-label="Chat with us on WhatsApp"
        className={cn(
          "group fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#25D366] text-white shadow-lg",
          "transition-transform duration-base ease-out hover:scale-110 active:scale-95",
          "sm:bottom-6 sm:right-6",
          className
        )}
      >
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/50 [animation-duration:2.5s] motion-reduce:hidden"
          aria-hidden="true"
        />
        <WhatsAppIcon className="relative h-7 w-7" />
      </a>
    );
  }

  if (variant === "cta") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={handleRipple}
        className={cn(
          "relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-md bg-[#25D366] px-5 py-4 text-body font-medium text-white",
          "transition-transform duration-base ease-out hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]",
          className
        )}
      >
        <WhatsAppIcon className="h-5 w-5" />
        Chat with us on WhatsApp
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={handleRipple}
      className={cn(
        "relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-md text-body-sm text-text-secondary",
        "transition-colors duration-fast hover:text-[#25D366]",
        className
      )}
    >
      <WhatsAppIcon className="h-4 w-4" />
      Message us on WhatsApp
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.08L2 22l5.06-1.33A9.95 9.95 0 0 0 12.02 22C17.54 22 22 17.52 22 12S17.54 2 12.02 2Zm0 1.8c4.53 0 8.2 3.67 8.2 8.2s-3.67 8.2-8.2 8.2a8.15 8.15 0 0 1-4.16-1.14l-.3-.17-3 .79.8-2.92-.2-.3A8.15 8.15 0 0 1 3.82 12c0-4.53 3.67-8.2 8.2-8.2Zm-3.32 3c-.18 0-.47.07-.72.34-.25.27-.94.92-.94 2.24s.96 2.6 1.1 2.78c.13.18 1.87 2.98 4.6 4.06 2.28.9 2.74.72 3.24.68.5-.05 1.62-.66 1.85-1.3.23-.63.23-1.17.16-1.29-.07-.11-.25-.18-.52-.32l-1.9-.94c-.25-.13-.44-.19-.63.13l-.83 1.03c-.15.18-.3.2-.55.07-.25-.13-1.08-.4-2.05-1.28-.76-.68-1.27-1.51-1.42-1.77-.15-.25-.02-.4.12-.52l.42-.5c.14-.17.19-.28.28-.47.09-.19.05-.35-.02-.49l-.9-2.15c-.22-.53-.44-.47-.63-.48h-.57Z" />
    </svg>
  );
}
