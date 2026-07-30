"use client";

import { useState } from "react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — button just won't confirm.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-body-sm text-text-tertiary transition-colors duration-fast hover:text-text-primary"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
