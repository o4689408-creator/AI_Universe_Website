import type { ReactNode } from "react";

export function InlineCode({ children }: { children?: ReactNode }) {
  return (
    <code className="rounded-sm bg-bg-surface-2 px-1.5 py-0.5 font-mono text-body-sm text-accent">
      {children}
    </code>
  );
}
