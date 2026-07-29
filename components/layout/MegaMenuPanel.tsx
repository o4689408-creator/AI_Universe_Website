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
}

export function MegaMenuPanel({
  columns,
  featured,
  onLinkClick,
  onSearchAction,
  align = "left",
}: MegaMenuPanelProps) {
  return (
    <div
      className={cn(
        "grid gap-6 p-6",
        featured ? "grid-cols-[1fr_200px]" : "grid-cols-1",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <div className={cn("grid gap-6", columns.length > 1 && "grid-cols-2")}>
        {columns.map((column) => (
          <div key={column.heading} className="flex flex-col gap-3">
            <span className="text-label uppercase text-text-tertiary">
              {column.heading}
            </span>
            <div className="flex flex-col gap-1">
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
        <Link
          href={featured.href}
          onClick={onLinkClick}
          className="group flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-surface-2 p-3 transition-all duration-base ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow-accent"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
            <Image
              src={featured.imageUrl}
              alt=""
              fill
              sizes="200px"
              className="object-cover transition-transform duration-slow ease-out group-hover:scale-105"
            />
          </div>
          <span className="text-label uppercase text-accent">{featured.category}</span>
          <span className="text-body-sm font-medium text-text-primary group-hover:text-accent">
            {featured.title}
          </span>
        </Link>
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
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface-2 text-text-secondary transition-all duration-base ease-out group-hover/link:scale-110 group-hover/link:rotate-3 group-hover/link:bg-accent-muted group-hover/link:text-accent group-hover/link:shadow-glow-accent">
        {link.icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-body-sm font-medium text-text-primary transition-colors duration-fast group-hover/link:text-accent">
          {link.title}
        </span>
        <span className="text-body-sm text-text-tertiary">{link.description}</span>
      </span>
    </>
  );

  const classes =
    "group/link flex items-start gap-3.5 rounded-lg p-2.5 text-left transition-all duration-base ease-out hover:-translate-y-0.5 hover:bg-bg-surface-2/70";

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
