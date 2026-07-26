"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Logo } from "@/components/layout/Logo";
import { NavMegaItem } from "@/components/layout/NavMegaItem";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  homeMenu,
  topicsMenu,
  videosMenu,
  searchMenu,
  exploreMenu,
  aboutMenu,
} from "@/lib/nav-menu-data";
import type { MegaMenuFeatured } from "@/components/layout/MegaMenuPanel";
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

  // Real content, not fabricated: the mega menu's featured cards pull
  // from whatever articles actually exist (topics is already sorted
  // newest-first — see lib/content.ts), so these stay accurate as
  // articles are added/removed without any code change.
  const featuredForHome: MegaMenuFeatured | undefined = useMemo(() => {
    const topic = topics[0];
    if (!topic) return undefined;
    return {
      title: topic.title,
      description: topic.subtitle,
      href: `/topics/${topic.slug}`,
      imageUrl: topic.heroImageUrl,
      category: topic.category,
    };
  }, [topics]);

  const featuredForTopics: MegaMenuFeatured | undefined = useMemo(() => {
    const topic = topics.find((item) => item.trending) ?? topics[0];
    if (!topic) return undefined;
    return {
      title: topic.title,
      description: topic.subtitle,
      href: `/topics/${topic.slug}`,
      imageUrl: topic.heroImageUrl,
      category: topic.category,
    };
  }, [topics]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full max-w-[100vw] overflow-hidden border-b border-border-subtle bg-bg-base/80 pt-safe backdrop-blur-md transition-shadow duration-slow ease-out",
        scrolled && "shadow-md"
      )}
    >
      <Container>
        <div className="flex h-16 w-full min-w-0 items-center justify-between gap-2">
          <Logo />

          {/* Desktop mega-menu nav — completely unchanged, hidden entirely below md so it can never affect mobile layout/width */}
          <nav className="hidden items-center gap-7 md:flex">
            <NavMegaItem
              label="Home"
              href="/"
              columns={homeMenu}
              featured={featuredForHome}
            />
            <NavMegaItem
              label="Topics"
              href="/topics"
              columns={topicsMenu}
              featured={featuredForTopics}
            />
            <NavMegaItem label="Videos" href="/videos" columns={videosMenu} />
            <NavMegaItem
              label="Search"
              columns={searchMenu}
              onClick={() => setPaletteOpen(true)}
              onSearchAction={() => setPaletteOpen(true)}
            />
            <NavMegaItem
              label="Explore"
              href="/#explore-your-ai-journey"
              columns={exploreMenu}
              align="right"
            />
            <NavMegaItem label="About" href="/about" columns={aboutMenu} align="right" />
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <a
              href="/library"
              aria-label="Your library"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast hover:text-text-primary sm:flex"
            >
              <BookmarkNavIcon />
            </a>

            <div className="hidden md:block">
              <Button href="/topics" size="md">
                Explore Topics
              </Button>
            </div>

            {/* Mobile menu trigger — the ONLY mobile-visible header
                action besides the logo. Search now lives inside the
                panel itself rather than as a competing icon here, so
                this button is never squeezed for space. Always
                rendered (never conditionally hidden by other icons),
                fixed 48px touch target. */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-text-primary md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </Container>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSearch={() => setPaletteOpen(true)}
      />

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
