import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

/**
 * Premium wordmark: the mark keeps its original identity (the same
 * four-point network glyph), refined with a two-stop gradient fill,
 * a soft ambient glow that blooms on hover, and a subtle 3D tilt on
 * the icon — restrained enough to stay "luxury minimal" rather than
 * flashy, per the site's design philosophy (one gradient, used once).
 */
export function Logo() {
  return (
    /*
     * Deliberately shrinkable (no `shrink-0` here) — this is the ONLY
     * flexible child in the header's top row; the icon cluster on the
     * right (ThemeToggle + hamburger) is `shrink-0` and must never
     * compress or move off-canvas. Giving the logo `min-w-0` plus a
     * `truncate` on its text span means the flex algorithm shrinks
     * THIS element first, down to its icon-only floor, before the row
     * can ever overflow the viewport. Without this, both ends of the
     * row were `shrink-0` and the row had zero slack — a fine margin
     * on a 320-390px phone at 100% OS font scale, but one Android
     * "larger text" setting, or a webfont-swap width jump, away from
     * silently clipping the hamburger button off the edge of the
     * screen (globals.css uses `overflow-x: clip`, not `hidden`, so an
     * overflow like that produces no scrollbar and no console error —
     * it just vanishes). Making the logo the sole flexible element
     * makes that entire class of bug structurally impossible rather
     * than dependent on exact text-width math.
     */
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-2 sm:gap-2.5"
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center [perspective:400px]">
        <span
          className="absolute inset-0 rounded-full bg-accent/0 blur-lg transition-all duration-slow ease-out group-hover:bg-accent/35"
          aria-hidden="true"
        />
        <svg
          width="34"
          height="34"
          viewBox="0 0 32 32"
          fill="none"
          className="relative transition-transform duration-slow ease-out group-hover:-rotate-3 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="logo-mark-gradient" x1="4" y1="26" x2="28" y2="4">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-accent-hover)" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" className="fill-bg-surface-1" />
          <rect
            width="31"
            height="31"
            x="0.5"
            y="0.5"
            rx="8.5"
            fill="none"
            stroke="url(#logo-mark-gradient)"
            strokeOpacity="0.35"
          />
          <g stroke="url(#logo-mark-gradient)" strokeWidth="1.3" strokeLinecap="round">
            <path d="M8 22 L14 12 L20 17 L24 9" />
          </g>
          <g fill="url(#logo-mark-gradient)">
            <circle cx="8" cy="22" r="2.3" />
            <circle cx="14" cy="12" r="2.3" />
            <circle cx="20" cy="17" r="2.3" />
            <circle cx="24" cy="9" r="2.3" />
          </g>
        </svg>
      </span>
      <span className="min-w-0 truncate bg-gradient-to-r from-text-primary to-text-primary bg-clip-text text-body font-semibold tracking-tight text-transparent transition-all duration-slow ease-out group-hover:from-accent group-hover:to-accent-hover sm:text-heading-4">
        {SITE_NAME}
      </span>
    </Link>
  );
}
