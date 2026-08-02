"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMagneticHover } from "@/lib/hooks/useMagneticHover";

interface NavItemBaseProps {
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  /**
   * Set when this item controls an expandable mega-menu panel — adds
   * `aria-expanded`/`aria-haspopup` (so assistive tech announces it as
   * a disclosure control, not a plain link) and a small chevron that
   * rotates open. Omit entirely for plain nav links with no panel.
   */
  expanded?: boolean;
}

interface NavItemLinkProps extends NavItemBaseProps {
  href: string;
  onClick?: never;
}

interface NavItemButtonProps extends NavItemBaseProps {
  href?: never;
  onClick: () => void;
}

type NavItemProps = NavItemLinkProps | NavItemButtonProps;

const baseClasses =
  "group relative inline-flex items-center gap-1.5 py-2 text-body-sm transition-[color,text-shadow] duration-fast";

const iconClasses = (active: boolean) =>
  cn(
    "transition-all duration-base ease-out",
    active ? "text-accent" : "text-text-tertiary group-hover:text-accent group-hover:scale-110"
  );

const underlineClasses = (active: boolean) =>
  cn(
    "pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent shadow-glow-accent transition-transform duration-base ease-out",
    active ? "scale-x-100" : "group-hover:scale-x-100"
  );

/**
 * Renders as a real Link (for routes) or a button (for the Search
 * action, which opens the command palette rather than navigating) —
 * same visual treatment either way, so the nav row reads as one
 * consistent system.
 *
 * Adds a very subtle magnetic-hover nudge (desktop only, reduced-
 * motion aware) on top of the existing underline reveal + active-state
 * indicator, plus a soft accent text-glow on hover/active. The
 * optional icon (rendered before the label) tints and scales up
 * slightly on hover/active, in sync with the label's own glow.
 */
export function NavItem(props: NavItemProps) {
  const active = props.active ?? false;
  const magneticRef = useMagneticHover<HTMLElement>(4);
  const textClass = active
    ? "text-text-primary [text-shadow:0_0_12px_rgba(76,125,255,0.35)]"
    : "text-text-secondary hover:text-text-primary hover:[text-shadow:0_0_10px_rgba(76,125,255,0.25)]";
  const hasPanel = props.expanded !== undefined;
  const ariaProps = hasPanel
    ? { "aria-haspopup": "true" as const, "aria-expanded": props.expanded }
    : {};

  if (props.href) {
    return (
      <Link
        ref={magneticRef as React.Ref<HTMLAnchorElement>}
        href={props.href}
        className={cn(baseClasses, textClass)}
        {...ariaProps}
      >
        {props.icon && <span className={iconClasses(active)}>{props.icon}</span>}
        {props.label}
        {hasPanel && <ChevronIcon open={props.expanded ?? false} />}
        <span className={underlineClasses(active)} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button
      ref={magneticRef as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={props.onClick}
      className={cn(baseClasses, textClass)}
      {...ariaProps}
    >
      {props.icon && <span className={iconClasses(active)}>{props.icon}</span>}
      {props.label}
      {hasPanel && <ChevronIcon open={props.expanded ?? false} />}
      <span className={underlineClasses(active)} aria-hidden="true" />
    </button>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className={cn(
        "text-text-tertiary transition-transform duration-base ease-out",
        open && "-rotate-180"
      )}
    >
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
