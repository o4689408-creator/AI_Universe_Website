"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { NavItem } from "@/components/layout/NavItem";
import { MegaMenuPanel, type MegaMenuFeatured } from "@/components/layout/MegaMenuPanel";
import type { MegaMenuColumn } from "@/lib/nav-menu-data";
import { cn } from "@/lib/utils";

interface NavMegaItemProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  columns: MegaMenuColumn[];
  featured?: MegaMenuFeatured;
  align?: "left" | "right";
  onSearchAction?: () => void;
}

const CLOSE_DELAY_MS = 200;

export function NavMegaItem({
  label,
  icon,
  href,
  onClick,
  columns,
  featured,
  align = "left",
  onSearchAction,
}: NavMegaItemProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
    setMounted(true);
  }, []);

  function openNow() {
    if (isTouchDevice.current) return;
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  }

  function closeWithDelay() {
    if (isTouchDevice.current) return;
    closeTimeout.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  // React's `onBlur` bubbles from every descendant (unlike the native
  // DOM `blur` event), so a plain `onBlur={closeWithDelay}` on this
  // wrapper fired every time focus moved from the trigger link to the
  // *first link inside the panel itself* — i.e. exactly the keyboard
  // interaction of tabbing into the menu the user is trying to use.
  // CLOSE_DELAY_MS papered over it most of the time, but it was a real
  // race, not a guarantee. Checking `relatedTarget` (where focus is
  // headed) against whether it's still inside this wrapper fixes it
  // properly: only start the close timer when focus is actually
  // leaving the menu entirely.
  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (isTouchDevice.current) return;
    const nextFocusTarget = event.relatedTarget as Node | null;
    if (nextFocusTarget && wrapperRef.current?.contains(nextFocusTarget)) return;
    closeWithDelay();
  }

  function closeNow() {
    setOpen(false);
    wrapperRef.current?.querySelector<HTMLElement>("a,button")?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeNow();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeWithDelay}
      onFocus={openNow}
      onBlur={handleBlur}
    >
      <NavItem
        label={label}
        icon={icon}
        expanded={open}
        active={href ? pathname === href : false}
        {...(href ? { href } : { onClick: onClick ?? (() => undefined) })}
      />

      {/*
        Dimming scrim behind the panel — rendered via a portal straight
        into document.body, NOT as a nested child here. This nav item
        sits inside <header>, which has `backdrop-blur-md`; per the CSS
        Filter Effects spec that makes <header> the containing block
        for any `position: fixed` descendant (the same bug class fixed
        in Header.tsx for MobileNav). A scrim nested in here would be
        trapped inside the header's own ~64px box instead of covering
        the page. Portaling it out sidesteps that entirely.

        This also directly addresses two real complaints: a panel that
        "covers the homepage content" with no visual acknowledgment
        reads as a rendering glitch, not an intentional overlay; and a
        panel whose own background is only a few RGB values different
        from the page behind it (dark mode: #111114 panel on #0a0a0c
        page) has almost no perceptible separation without one. Click
        anywhere on the scrim closes the menu.
      */}
      {mounted &&
        createPortal(
          <div
            aria-hidden="true"
            onClick={closeNow}
            className={cn(
              "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ease-out",
              open ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          />,
          document.body
        )}

      {/* Gradient border: a 1px ring built from a gradient background
          on this outer wrapper, showing through a 1px inset gap to the
          solid inner panel — crisper and more "premium app" than a
          flat single-color border. */}
      <div
        className={cn(
          "absolute top-full z-50 mt-3 origin-top rounded-[18px] bg-gradient-to-br from-accent/50 via-border to-accent/20 p-px transition-all ease-out",
          featured ? "w-[560px]" : "w-[340px]",
          align === "right" ? "right-0" : "left-0",
          open
            ? "translate-y-0 scale-100 opacity-100 duration-200"
            : "pointer-events-none -translate-y-1.5 scale-[0.97] opacity-0 duration-150"
        )}
      >
        <div className="relative overflow-hidden rounded-[17px] bg-bg-surface-1/[0.98] shadow-[var(--shadow-lg),var(--shadow-glow-accent)] backdrop-blur-xl">
          <div
            className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-accent/[0.12] blur-3xl"
            aria-hidden="true"
          />
          <MegaMenuPanel
            columns={columns}
            featured={featured}
            align={align}
            open={open}
            onLinkClick={closeNow}
            onSearchAction={() => {
              closeNow();
              onSearchAction?.();
            }}
          />
        </div>
      </div>
    </div>
  );
}
