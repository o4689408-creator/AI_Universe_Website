import { isValidElement } from "react";
import type { ReactNode } from "react";
import { highlightCode } from "@/lib/highlight-code";
import { CopyButton } from "@/components/article/CopyButton";

interface CodeBlockProps {
  children: ReactNode;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractText(props.children);
  }
  return "";
}

/**
 * A Server Component, deliberately. MDX passes fenced code blocks as
 * <pre><code className="language-xxx">; this component reads that
 * className/children directly from the (still-unrendered) inner
 * element — which only works reliably here because CodeBlock stays a
 * Server Component. If this were a Client Component, React would be
 * forced to eagerly render the inner `code` element (since it's
 * resolved to the InlineCode component — see mdx-components.tsx)
 * *before* crossing the server/client boundary, which replaces the
 * original className with InlineCode's own rendered className —
 * a real bug caught during Batch 1 verification, not a hypothetical.
 * The only genuinely interactive piece (the Copy button) is isolated
 * into its own tiny Client Component (CopyButton) that receives a
 * plain string, which crosses the boundary safely.
 */
export function CodeBlock({ children }: CodeBlockProps) {
  const codeElement = isValidElement(children) ? children : null;
  const codeProps = (codeElement?.props ?? {}) as { className?: string; children?: ReactNode };
  const language = codeProps.className?.replace("language-", "") ?? "text";
  const code = extractText(codeProps.children).replace(/\n$/, "");

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-2">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
        <span className="text-label uppercase text-text-tertiary">{language}</span>
        <CopyButton code={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-body-sm leading-relaxed">
        <code className="font-mono text-text-secondary">{highlightCode(code)}</code>
      </pre>
    </div>
  );
}
