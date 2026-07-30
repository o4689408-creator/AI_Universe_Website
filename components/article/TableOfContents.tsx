"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/types/content";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0]!.target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Native <details>/<summary> has no built-in "close on Escape"
  // behavior in any browser — without this, opening the mobile
  // Contents panel and pressing Escape does nothing.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && detailsRef.current?.open) {
        detailsRef.current.open = false;
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (headings.length === 0) return null;

  const links = (
    <nav className="flex flex-col gap-2">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={cn(
            "text-label text-text-secondary transition-colors duration-fast hover:text-text-primary",
            heading.level === 3 && "pl-3",
            activeId === heading.id && "text-accent"
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: sticky left rail */}
      <div className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-3">
          <span className="text-label uppercase text-text-tertiary">
            Contents
          </span>
          {links}
        </div>
      </div>

      {/* Mobile/tablet: collapsible toggle */}
      <details ref={detailsRef} className="mb-6 rounded-lg border border-border-subtle bg-bg-surface-1 lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-body-sm font-medium text-text-primary">
          Contents
        </summary>
        <div className="border-t border-border-subtle px-4 py-3">{links}</div>
      </details>
    </>
  );
}
