import Link from "next/link";
import Image from "next/image";
import type { MegaMenuColumn } from "@/lib/nav-menu-data";
import { cn } from "@/lib/utils";

export interface MegaMenuFeatured {
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  category: string;
}

interface MegaMenuPanelProps {
  columns: MegaMenuColumn[];
  featured?: MegaMenuFeatured;
  onLinkClick?: () => void;
  onSearchAction?: () => void;
  /** Anchors the panel to the left or right edge of its trigger — right-anchored for nav items sitting near the edge of the header, so the panel never spills past the viewport. */
  align?: "left" | "right";
  /**
   * Drives the independent per-section stagger (link columns fade up
   * first, the featured card follows a beat later from the side) —
   * threaded down from NavMegaItem's own open/closed state so each
   * section can animate on its own schedule rather than the whole
   * panel moving as one flat block.
   */
  open: boolean;
}

export function MegaMenuPanel({
  columns,
  featured,
  onLinkClick,
  onSearchAction,
  align = "left",
  open,
}: MegaMenuPanelProps) {
  return (
    <div
      className={cn(
        "grid gap-5 p-5",
        featured ? "grid-cols-[1.3fr_1fr]" : "grid-cols-1",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-5 transition-all ease-out",
          open
            ? "translate-y-0 opacity-100 duration-300 [transition-delay:40ms]"
            : "translate-y-1 opacity-0 duration-100"
        )}
      >
        {columns.map((column) => (
          <div key={column.heading} className="flex flex-col gap-1">
            <div className="mb-1.5 flex items-center gap-2 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span className="text-label font-semibold uppercase tracking-wider text-text-tertiary">
                {column.heading}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {column.links.map((link) => (
                <MegaMenuLinkItem
                  key={link.title}
                  link={link}
                  onLinkClick={onLinkClick}
                  onSearchAction={onSearchAction}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {featured && (
        <div
          className={cn(
            "relative transition-all ease-out",
            open
              ? "translate-x-0 opacity-100 duration-300 [transition-delay:90ms]"
              : "translate-x-1.5 opacity-0 duration-100"
          )}
        >
          {/* Vertical divider — the "clear visual separation" between
              the link list and the featured card, distinct from just
              a gap. */}
          <span
            className="absolute -left-2.5 top-1 bottom-1 w-px bg-border-subtle"
            aria-hidden="true"
          />
          <Link
            href={featured.href}
            onClick={onLinkClick}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface-2 transition-all duration-base ease-out hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-accent"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={featured.imageUrl}
                alt=""
                fill
                sizes="220px"
                className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.08]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0"
                aria-hidden="true"
              />
              <span className="absolute left-3 top-3 rounded-full bg-bg-base/90 px-2.5 py-1 text-label font-medium uppercase tracking-wide text-accent backdrop-blur-sm">
                {featured.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <span className="text-body-sm font-semibold leading-snug text-text-primary transition-colors duration-fast group-hover:text-accent">
                {featured.title}
              </span>
              <span className="line-clamp-2 text-label text-text-tertiary">
                {featured.description}
              </span>
              <span className="mt-auto flex items-center gap-1 pt-1 text-label font-medium text-accent">
                Read article
                <ArrowIcon className="transition-transform duration-base ease-out group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

function MegaMenuLinkItem({
  link,
  onLinkClick,
  onSearchAction,
}: {
  link: MegaMenuColumn["links"][number];
  onLinkClick?: () => void;
  onSearchAction?: () => void;
}) {
  const content = (
    <>
      {/* Left accent bar — scales in on hover, a Linear/Vercel-style
          active indicator that's much clearer than a background tint
          alone, and never competes visually with the icon badge. */}
      <span
        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 origin-center scale-y-0 rounded-full bg-accent transition-transform duration-base ease-out group-hover/link:scale-y-100"
        aria-hidden="true"
      />
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-gradient-to-b from-bg-surface-2 to-bg-surface-1 text-text-secondary transition-all duration-base ease-out group-hover/link:scale-110 group-hover/link:border-accent/40 group-hover/link:from-accent-muted group-hover/link:to-accent-muted group-hover/link:text-accent group-hover/link:shadow-glow-accent [&_svg]:h-5 [&_svg]:w-5">
        {link.icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-body-sm font-semibold text-text-primary transition-colors duration-fast group-hover/link:text-accent">
          {link.title}
        </span>
        <span className="truncate text-label text-text-tertiary">{link.description}</span>
      </span>
    </>
  );

  const classes =
    "group/link relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 pl-5 text-left transition-colors duration-base ease-out hover:bg-accent-muted/60";

  if (!link.href) {
    return (
      <button type="button" onClick={onSearchAction} className={classes}>
        {content}
      </button>
    );
  }

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onLinkClick}
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} onClick={onLinkClick} className={classes}>
      {content}
    </Link>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path
        d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
