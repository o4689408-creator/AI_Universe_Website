"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMagneticHover } from "@/lib/hooks/useMagneticHover";

interface NavItemBaseProps {
  label: ReactNode;
  active?: boolean;
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
  "group relative inline-block py-2 text-body-sm transition-[color,text-shadow] duration-fast";

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
 * indicator, plus a soft accent text-glow on hover/active.
 */
export function NavItem(props: NavItemProps) {
  const active = props.active ?? false;
  const magneticRef = useMagneticHover<HTMLElement>(4);
  const textClass = active
    ? "text-text-primary [text-shadow:0_0_12px_rgba(76,125,255,0.35)]"
    : "text-text-secondary hover:text-text-primary hover:[text-shadow:0_0_10px_rgba(76,125,255,0.25)]";

  if (props.href) {
    return (
      <Link
        ref={magneticRef as React.Ref<HTMLAnchorElement>}
        href={props.href}
        className={cn(baseClasses, textClass)}
      >
        {props.label}
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
    >
      {props.label}
      <span className={underlineClasses(active)} aria-hidden="true" />
    </button>
  );
}
