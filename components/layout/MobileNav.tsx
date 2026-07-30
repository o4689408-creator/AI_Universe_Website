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
      { label: "Home", href: "/", icon: HomeIcon },
      { label: "Topics", href: "/topics", icon: TopicsIcon },
      { label: "Videos", href: "/videos", icon: VideosIcon },
      { label: "About", href: "/about", icon: AboutIcon },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Explore Your AI Journey", href: "/#explore-your-ai-journey", icon: CompassIcon },
      { label: "Your Library", href: "/library", icon: BookmarkNavIcon },
    ],
  },
  {
    heading: "Get in touch",
    links: [
      { label: "Contact", href: "/contact", icon: ContactIcon },
      { label: "Newsletter", href: "/#newsletter", icon: NewsletterIcon },
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
        "fixed inset-0 z-[100] flex max-w-[100vw] flex-col overflow-hidden bg-bg-base/90 backdrop-blur-2xl transition-opacity duration-base ease-out lg:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      {/* Restrained ambient glow, consistent with the rest of the site's premium surfaces */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/[0.10] blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border-subtle px-4 pt-safe">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-text-primary transition-transform duration-fast ease-out hover:scale-110 active:scale-90"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 pb-safe pl-safe pr-safe pt-6">
        <div
          key={open ? "open" : "closed"}
          className={cn(
            "flex flex-col gap-6 transition-all duration-slow ease-out",
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.heading}
              className="flex flex-col gap-2 opacity-0 animate-fade-up"
              style={{ animationDelay: open ? `${80 + groupIndex * 60}ms` : "0ms" }}
            >
              <span className="px-1 text-label uppercase text-text-tertiary">
                {group.heading}
              </span>
              <div className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-bg-surface-1/70 p-1.5 shadow-md">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      onPointerDown={handleRipple}
                      className={cn(
                        "group relative flex min-h-[48px] items-center gap-3 overflow-hidden rounded-lg px-3 py-3 text-body-lg font-medium transition-all duration-base ease-out active:bg-bg-surface-2",
                        isActive
                          ? "bg-accent-muted text-accent shadow-glow-accent"
                          : "text-text-primary hover:translate-x-0.5 hover:bg-bg-surface-2/60"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-base ease-out",
                          isActive
                            ? "bg-accent/15 text-accent"
                            : "bg-bg-surface-2 text-text-secondary group-hover:scale-110 group-hover:text-accent"
                        )}
                      >
                        <Icon />
                      </span>
                      {link.label}
                      {/* Animated active-page indicator — a soft pulsing dot, distinct from the background tint above. */}
                      {isActive && (
                        <span className="ml-auto flex h-2 w-2 shrink-0 items-center justify-center">
                          <span className="absolute h-2 w-2 animate-particle-pulse rounded-full bg-accent" />
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}

          <div
            className="flex flex-col gap-2 opacity-0 animate-fade-up"
            style={{ animationDelay: open ? "260ms" : "0ms" }}
          >
            <span className="px-1 text-label uppercase text-text-tertiary">Search</span>
            <div className="rounded-xl border border-border-subtle bg-bg-surface-1/70 p-1.5 shadow-md">
              <button
                type="button"
                onPointerDown={handleRipple}
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="group relative flex min-h-[48px] w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-3 text-left text-body-lg font-medium text-text-primary transition-colors duration-fast active:bg-bg-surface-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface-2 text-text-secondary transition-all duration-base ease-out group-hover:scale-110 group-hover:text-accent">
                  <SearchIcon />
                </span>
                Quick Search (⌘K)
              </button>
            </div>
          </div>

          <div
            className="flex min-h-[48px] items-center justify-between rounded-xl border border-border-subtle bg-bg-surface-1/70 px-4 py-3 opacity-0 shadow-md animate-fade-up"
            style={{ animationDelay: open ? "320ms" : "0ms" }}
          >
            <span className="flex items-center gap-3 text-body-lg font-medium text-text-primary">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface-2 text-text-secondary">
                <ThemeIcon />
              </span>
              Theme
            </span>
            <ThemeToggle />
          </div>

          <div
            className="pb-4 opacity-0 animate-fade-up"
            style={{ animationDelay: open ? "380ms" : "0ms" }}
          >
            <Button href="/topics" size="lg" className="w-full min-h-[48px]">
              Explore Topics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function iconProps() {
  return { width: 18, height: 18, viewBox: "0 0 18 18", fill: "none" as const, "aria-hidden": true as const };
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

function HomeIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 8.5 9 3l6 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 7.5V15h9V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TopicsIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="3.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="10.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function VideosIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="2.5" y="4.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.2 7.3 10.6 9l-3.4 1.7V7.3Z" fill="currentColor" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 8.2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="5.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.2 6.8 9.8 9.8l-3 1.4 1.4-3 3-1.4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkNavIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M5 3.5h8a.5.5 0 0 1 .5.5v10.6a.3.3 0 0 1-.46.25L9 12.05l-4.04 2.8a.3.3 0 0 1-.46-.25V4a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="2.5" y="4" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 5.5 9 10 14.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NewsletterIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 5.5 9 2l6 3.5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.5 6.5 9 9.5l4.5-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 12 15.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M14.5 10.4A5.6 5.6 0 1 1 7.6 3.5a4.4 4.4 0 0 0 6.9 6.9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
