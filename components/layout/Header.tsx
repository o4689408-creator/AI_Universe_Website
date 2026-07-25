"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Logo } from "@/components/layout/Logo";
import { NavItem } from "@/components/layout/NavItem";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import type { TopicMeta } from "@/types/content";

interface HeaderProps {
  topics: TopicMeta[];
}

export function Header({ topics }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Global Cmd/Ctrl+K shortcut — Header is always mounted (root layout),
  // so this is the single place the listener needs to live.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Subtle shadow once the page has scrolled — keeps the header feeling
  // grounded over content instead of just floating with a hairline.
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const routeLinks = [
    { label: "Home", href: "/" },
    { label: "Topics", href: "/topics" },
    { label: "Videos", href: "/videos" },
    { label: "About", href: "/about" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md transition-shadow duration-slow ease-out",
        scrolled && "shadow-md"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {routeLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href}
              />
            ))}
            <NavItem
              label={
                <span className="flex items-center gap-1.5">
                  Search
                  <kbd className="rounded border border-border-subtle px-1 text-label text-text-tertiary">
                    ⌘K
                  </kbd>
                </span>
              }
              onClick={() => setPaletteOpen(true)}
            />
            <NavItem label="Explore" href="/#explore-your-ai-journey" />
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <a
              href="/library"
              aria-label="Your library"
              className="hidden h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast hover:text-text-primary sm:flex"
            >
              <BookmarkNavIcon />
            </a>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast hover:text-text-primary md:hidden"
            >
              <SearchIcon />
            </button>

            <div className="hidden md:block">
              <Button href="/topics" size="md">
                Explore Topics
              </Button>
            </div>

            {/* Mobile menu trigger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-text-primary md:hidden"
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile full-screen overlay nav */}
      <div
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col gap-2 bg-bg-base px-4 pt-8 transition-opacity duration-base ease-out md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        {routeLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "rounded-md px-4 py-4 text-heading-3-mobile transition-colors duration-fast hover:bg-bg-surface-1",
              pathname === link.href ? "text-accent" : "text-text-primary"
            )}
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setPaletteOpen(true);
          }}
          className="rounded-md px-4 py-4 text-left text-heading-3-mobile text-text-primary transition-colors duration-fast hover:bg-bg-surface-1"
        >
          Search
        </button>
        <a
          href="/#explore-your-ai-journey"
          onClick={() => setMobileOpen(false)}
          className="rounded-md px-4 py-4 text-heading-3-mobile text-text-primary transition-colors duration-fast hover:bg-bg-surface-1"
        >
          Explore
        </a>
        <a
          href="/library"
          onClick={() => setMobileOpen(false)}
          className="rounded-md px-4 py-4 text-heading-3-mobile text-text-primary transition-colors duration-fast hover:bg-bg-surface-1"
        >
          Your Library
        </a>
        <div className="flex items-center justify-between rounded-md px-4 py-4">
          <span className="text-heading-3-mobile text-text-primary">Theme</span>
          <ThemeToggle />
        </div>
        <div className="px-4 pt-4">
          <Button href="/topics" size="lg" className="w-full">
            Explore Topics
          </Button>
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        topics={topics}
      />
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {open ? (
        <path
          d="M5 5L15 15M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M2.5 6H17.5M2.5 10H17.5M2.5 14H17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 2.5h8a.5.5 0 0 1 .5.5v10.3a.3.3 0 0 1-.46.25L8 10.8l-4.04 2.75a.3.3 0 0 1-.46-.25V3a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
