"use client";

import { useMemo } from "react";
import { computeReadabilityStats } from "@/lib/readability";
import { extractHeadings } from "@/lib/heading-utils";
import { estimateReadTimeMinutes } from "@/lib/admin/validation";
import { cn } from "@/lib/utils";

export function EditorStatsBar({
  content,
  onJumpToHeading,
}: {
  content: string;
  onJumpToHeading: (headingText: string) => void;
}) {
  const stats = useMemo(() => computeReadabilityStats(content), [content]);
  const headings = useMemo(() => extractHeadings(content), [content]);
  const readTime = useMemo(() => estimateReadTimeMinutes(content), [content]);
  const charCount = content.length;

  return (
    <div className="flex flex-col gap-4 border-t border-border-subtle bg-bg-surface-2/30 p-4 text-body-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-text-tertiary">
        <Stat label="Words" value={stats.wordCount.toLocaleString()} />
        <Stat label="Characters" value={charCount.toLocaleString()} />
        <Stat label="Paragraphs" value={stats.paragraphCount.toLocaleString()} />
        <Stat label="Reading time" value={`${readTime} min`} />
        <Stat
          label="Readability"
          value={stats.label}
          tone={
            stats.fleschScore >= 60 ? "success" : stats.fleschScore >= 30 ? "warning" : "error"
          }
        />
      </div>

      {headings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-label font-medium uppercase tracking-wide text-text-tertiary">
            Table of contents
          </p>
          <div className="flex flex-col gap-0.5">
            {headings.map((heading, i) => (
              <button
                key={`${heading.id}-${i}`}
                type="button"
                onClick={() => onJumpToHeading(heading.text)}
                className={cn(
                  "flex items-center gap-2 rounded px-2 py-1 text-left text-body-sm text-text-secondary transition-colors duration-fast hover:bg-bg-surface-3 hover:text-text-primary",
                  heading.level === 3 && "ml-4"
                )}
              >
                <span className="truncate">{heading.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "error" }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className={cn(
          "font-medium",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "error" && "text-error",
          !tone && "text-text-secondary"
        )}
      >
        {value}
      </span>
      <span>{label}</span>
    </span>
  );
}
