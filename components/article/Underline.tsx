import type { ReactNode } from "react";

export function Underline({ children }: { children?: ReactNode }) {
  return <u className="underline decoration-border underline-offset-2">{children}</u>;
}
