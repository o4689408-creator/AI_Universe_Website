"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRipple } from "@/lib/hooks/useRipple";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
}

const navGroups = [
  {
    heading: "Browse",
    links: [
      { label: "Home", href: "/" },
      { label: "Topics", href: "/topics" },
      { label: "Videos", href: "/videos" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Explore Your AI Journey", href: "/#explore-your-ai-journey" },
      { label: "Your Library", href: "/library" },
    ],
  },
  {
    heading: "Get in touch",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Newsletter", href: "/#newsletter" },
    ],
  },
];

/**
 * A completely self-contained full-screen panel — deliberately NOT
 * positioned relative to the real <header>'s height via a calc()
 * offset (the previous approach was fragile: any mismatch between
 * assumed and real header height — e.g. from safe-area insets
 * rendering slightly differently across Android browsers — could
 * misalign or clip it). A `fixed inset-0` panel with its own internal
 * top bar (logo + close button) removes that entire class of bug.
 */
export function MobileNav({ open, onClose, onSearch }: MobileNavProps) {
  const pathname = usePathname();
  const handleRipple = useRipple();

  // Lock background scroll while the panel is open — prevents the
  // page underneath from scrolling and revealing extra space behind
  // the panel on some Android browsers.
  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex max-w-[100vw] flex-col overflow-hidden bg-bg-base/90 backdrop-blur-2xl transition-opacity duration-base ease-out md:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle px-4 pt-safe">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-text-primary"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-safe pl-safe pr-safe pt-6">
        <div
          className={cn(
            "flex flex-col gap-6 transition-all duration-slow ease-out",
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          {navGroups.map((group) => (
            <div key={group.heading} className="flex flex-col gap-2">
              <span className="px-1 text-label uppercase text-text-tertiary">
                {group.heading}
              </span>
              <div className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-bg-surface-1/70 p-1.5 shadow-md">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      onPointerDown={handleRipple}
                      className={cn(
                        "relative flex min-h-[48px] items-center overflow-hidden rounded-lg px-4 py-3 text-body-lg font-medium transition-colors duration-fast active:bg-bg-surface-2",
                        isActive
                          ? "bg-accent-muted text-accent shadow-glow-accent"
                          : "text-text-primary"
                      )}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <span className="px-1 text-label uppercase text-text-tertiary">Search</span>
            <div className="rounded-xl border border-border-subtle bg-bg-surface-1/70 p-1.5 shadow-md">
              <button
                type="button"
                onPointerDown={handleRipple}
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="relative flex min-h-[48px] w-full items-center overflow-hidden rounded-lg px-4 py-3 text-left text-body-lg font-medium text-text-primary transition-colors duration-fast active:bg-bg-surface-2"
              >
                Quick Search (⌘K)
              </button>
            </div>
          </div>

          <div className="flex min-h-[48px] items-center justify-between rounded-xl border border-border-subtle bg-bg-surface-1/70 px-4 py-3 shadow-md">
            <span className="text-body-lg font-medium text-text-primary">Theme</span>
            <ThemeToggle />
          </div>

          <div className="pb-4">
            <Button href="/topics" size="lg" className="w-full min-h-[48px]">
              Explore Topics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
