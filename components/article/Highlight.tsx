import type { ReactNode } from "react";

export function Highlight({ children }: { children?: ReactNode }) {
  return (
    <mark className="rounded-sm bg-accent-muted px-1 text-text-primary">{children}</mark>
  );
}
