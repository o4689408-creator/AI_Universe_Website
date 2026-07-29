"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NavItem } from "@/components/layout/NavItem";
import { MegaMenuPanel, type MegaMenuFeatured } from "@/components/layout/MegaMenuPanel";
import type { MegaMenuColumn } from "@/lib/nav-menu-data";
import { cn } from "@/lib/utils";

interface NavMegaItemProps {
  label: string;
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
      onBlur={closeWithDelay}
    >
      <NavItem
        label={label}
        active={href ? pathname === href : false}
        {...(href ? { href } : { onClick: onClick ?? (() => undefined) })}
      />

      <div
        className={cn(
          "absolute top-full z-40 mt-3 w-[420px] origin-top overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface-1/85 shadow-[var(--shadow-lg),var(--shadow-glow-accent)] backdrop-blur-2xl ring-1 ring-white/[0.04] transition-all duration-slow ease-out",
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
