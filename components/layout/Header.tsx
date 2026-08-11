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
  newsMenu,
  videosMenu,
  exploreMenu,
  aboutMenu,
} from "@/lib/nav-menu-data";
import type { MegaMenuFeatured } from "@/components/layout/MegaMenuPanel";
import { cn } from "@/lib/utils";
import type { TopicMeta, Video } from "@/types/content";

interface HeaderProps {
  topics: TopicMeta[];
  videos?: Video[];
}

export function Header({ topics, videos = [] }: HeaderProps) {
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
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full max-w-[100vw] border-b border-border-subtle bg-bg-base/80 pt-safe backdrop-blur-md transition-shadow duration-slow ease-out",
          scrolled && "shadow-md"
        )}
      >
        <Container>
          <div className="flex h-16 w-full min-w-0 items-center justify-between gap-3">
            <Logo />

            {/* Desktop mega-menu nav — only shown at lg+ where there's
                guaranteed room for the full label set plus the trailing
                actions without squeezing the logo. Showing this as early
                as md (768px) left a "squeeze zone" on tablets/narrow
                desktop windows where the logo and nav visually crowded
                each other — bumping to lg removes that zone entirely
                rather than trying to out-shrink it with flex hacks. */}
            <nav className="hidden items-center gap-6 lg:flex">
              <NavMegaItem
                label="Home"
                icon={<HomeNavIcon />}
                href="/"
                columns={homeMenu}
                featured={featuredForHome}
              />
              <NavMegaItem
                label="Topics"
                icon={<TopicsNavIcon />}
                href="/topics"
                columns={topicsMenu}
                featured={featuredForTopics}
              />
              <NavMegaItem label="Videos" icon={<VideosNavIcon />} href="/videos" columns={videosMenu} />
              <NavMegaItem
                label={
                  <span className="flex items-center gap-1.5">
                    AI News
                    <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      New
                    </span>
                  </span>
                }
                icon={<NewsNavIcon />}
                href="/news"
                columns={newsMenu}
              />
              <NavMegaItem
                label="Explore"
                icon={<ExploreNavIcon />}
                href="/#explore-your-ai-journey"
                columns={exploreMenu}
                align="right"
              />
              <NavMegaItem
                label="About"
                icon={<AboutNavIcon />}
                href="/about"
                columns={aboutMenu}
                align="right"
              />
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              {/* Always visible — on every breakpoint, on every page —
                  rather than hidden until the mobile panel is opened. */}
              <ThemeToggle />

              <a
                href="/library"
                aria-label="Your library"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast hover:text-text-primary sm:flex"
              >
                <BookmarkNavIcon />
              </a>

              <div className="hidden lg:block">
                <Button href="/topics" size="md">
                  Explore Topics
                </Button>
              </div>

              {/* Mobile/tablet menu trigger — visible below the lg
                  breakpoint where the full desktop nav is hidden, so
                  there's always exactly one way to reach navigation,
                  never zero. Glassmorphism pill with a soft accent glow
                  on open, fixed 48px touch target. z-[60], one above
                  the header's own z-50, so it's never visually
                  obscured by anything else painted within the header. */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className={cn(
                  "relative z-[60] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-base ease-out lg:hidden",
                  mobileOpen
                    ? "border-accent/40 bg-accent-muted text-accent shadow-glow-accent"
                    : "border-border-subtle bg-bg-surface-1/70 text-text-primary shadow-[var(--shadow-sm)] backdrop-blur-md hover:border-border hover:shadow-md active:scale-95"
                )}
                onClick={() => setMobileOpen((value) => !value)}
              >
                <MenuIcon open={mobileOpen} />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/*
        CRITICAL: MobileNav and CommandPalette are full-screen
        `position: fixed` overlays, and they render here — as siblings
        AFTER </header> closes — deliberately, not as children of
        <header>. The header has `backdrop-blur-md` (a backdrop-filter),
        and per the CSS Filter Effects spec, any element with a
        non-none `filter`/`backdrop-filter` becomes the *containing
        block* for its `position: fixed` (and absolute) descendants
        instead of the viewport. Concretely: a fixed `inset-0` overlay
        nested inside the header would resolve its 0/0/0/0 offsets
        against the header's own ~64px-tall box, not the real
        viewport — visually trapping a "full-screen" panel inside a
        sliver at the top of the screen. This is confirmed browser
        behavior (Chrome, Firefox, and Safari all implement this), not
        a Tailwind or React quirk, and it silently breaks regardless of
        how correct the overlay's own internal CSS is. Keeping these
        two components as direct children of the fragment here (i.e.
        genuine siblings of <header> in the real DOM, both ultimately
        rendered straight under <body>) is what lets `fixed inset-0`
        mean what it says.
      */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSearch={() => setPaletteOpen(true)}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        topics={topics}
        videos={videos}
      />
    </>
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

function HomeNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 7.5 8 3l5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 6.7V13h8V6.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TopicsNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="3" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="3" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2.5" y="9.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function VideosNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="8" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.7 6.3 9.8 8l-3.1 1.7V6.3Z" fill="currentColor" />
    </svg>
  );
}

function NewsNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="9.5" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 6.2h4.5M4 8.2h4.5M4 10.2h2.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M11 5.2h1.5a1.5 1.5 0 0 1 1.5 1.5v4.6a1.5 1.5 0 0 1-1.5 1.5H4.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function ExploreNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 6 8.7 8.7 6 10l1.3-2.7L10 6Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function AboutNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.2v3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5.2" r="0.8" fill="currentColor" />
    </svg>
  );
}
