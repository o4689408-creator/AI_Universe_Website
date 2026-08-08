"use client";

import { useState } from "react";

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-border-subtle px-2.5 py-1.5 text-label font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
    >
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}
