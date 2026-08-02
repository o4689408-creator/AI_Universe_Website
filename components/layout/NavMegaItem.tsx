"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NavItem } from "@/components/layout/NavItem";
import { MegaMenuPanel, type MegaMenuFeatured } from "@/components/layout/MegaMenuPanel";
import type { MegaMenuColumn } from "@/lib/nav-menu-data";
import { cn } from "@/lib/utils";

interface NavMegaItemProps {
  label: string;
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
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
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

      <div
        className={cn(
          "absolute top-full z-40 mt-3 origin-top overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface-1/90 shadow-[var(--shadow-lg),var(--shadow-glow-accent)] backdrop-blur-2xl ring-1 ring-white/[0.04] transition-all duration-slow ease-out",
          featured ? "w-[560px]" : "w-[340px]",
          align === "right" ? "right-0" : "left-0",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.96] opacity-0"
        )}
      >
        {/* Soft animated accent glow along the top edge — the "animated border" premium detail. */}
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-accent/[0.10] blur-3xl"
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
  );
}
