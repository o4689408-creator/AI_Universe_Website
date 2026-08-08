"use client";

import { useMemo, useState } from "react";
import { checkUrlsAction, type UrlCheckResult } from "@/lib/admin/actions/preview-actions";
import { cn } from "@/lib/utils";

const MARKDOWN_LINK_PATTERN = /\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;

function extractLinks(content: string): string[] {
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK_PATTERN.exec(content)) !== null) {
    if (match[1]) links.push(match[1]);
  }
  return Array.from(new Set(links));
}

export function LinkChecker({ content }: { content: string }) {
  const [results, setResults] = useState<UrlCheckResult[] | null>(null);
  const [checking, setChecking] = useState(false);

  const links = useMemo(() => extractLinks(content), [content]);

  async function runCheck() {
    if (links.length === 0) return;
    setChecking(true);
    try {
      const checked = await checkUrlsAction(links);
      setResults(checked);
    } finally {
      setChecking(false);
    }
  }

  if (links.length === 0) {
    return <p className="text-body-sm text-text-tertiary">No external links in this article yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-text-tertiary">
          {links.length} external link{links.length === 1 ? "" : "s"} found.
        </p>
        <button
          type="button"
          onClick={runCheck}
          disabled={checking}
          className="rounded-md border border-border-subtle px-3 py-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary disabled:opacity-50"
        >
          {checking ? "Checking…" : "Check links"}
        </button>
      </div>

      {results && (
        <ul className="flex flex-col gap-1.5">
          {results.map((result) => (
            <li key={result.url} className="flex items-center gap-2 text-body-sm">
              <StatusDot status={result.status} />
              <span className="truncate text-text-secondary">{result.url}</span>
              <span className="ml-auto shrink-0 text-label text-text-tertiary">
                {result.status === "ok" && `${result.httpStatus}`}
                {result.status === "broken" && `${result.httpStatus ?? "error"}`}
                {result.status === "timeout" && "timed out"}
                {result.status === "blocked" && "blocked"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: UrlCheckResult["status"] }) {
  return (
    <span
      className={cn(
        "h-2 w-2 shrink-0 rounded-full",
        status === "ok" && "bg-success",
        status === "broken" && "bg-error",
        status === "timeout" && "bg-warning",
        status === "blocked" && "bg-text-tertiary"
      )}
    />
  );
}
