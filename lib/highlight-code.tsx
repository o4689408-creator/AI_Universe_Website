import type { ReactNode } from "react";

/**
 * A deliberately simple, dependency-free syntax highlighter.
 *
 * This is NOT a real tokenizer/AST-based highlighter (that's what
 * Shiki or Prism are for, and either would be a legitimate dependency
 * to add later if full-fidelity, per-language-grammar highlighting
 * becomes worth the page-weight). This covers the common cases
 * (comments, strings, numbers, a shared keyword list spanning
 * JS/TS/Python/bash) with a single regex pass — good enough to make
 * code blocks look premium without adding a library.
 */

const KEYWORDS = new Set([
  // JS/TS
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "import", "from", "export", "default", "class", "extends", "new", "async",
  "await", "try", "catch", "finally", "throw", "interface", "type", "public",
  "private", "protected", "static", "void", "switch", "case", "break",
  "continue", "true", "false", "null", "undefined", "this", "super",
  // Python
  "def", "elif", "in", "is", "None", "True", "False", "self", "lambda",
  "with", "as", "pass", "yield", "raise", "not", "and", "or",
  // Bash
  "echo", "then", "fi", "do", "done", "esac",
]);

const TOKEN_PATTERN = new RegExp(
  [
    "(\\/\\/.*$)", // line comment //
    "(#.*$)", // line comment #
    "(\\/\\*[\\s\\S]*?\\*\\/)", // block comment
    "('(?:[^'\\\\]|\\\\.)*')", // single-quoted string
    '("(?:[^"\\\\]|\\\\.)*")', // double-quoted string
    "(`(?:[^`\\\\]|\\\\.)*`)", // template string
    "(\\b\\d+(?:\\.\\d+)?\\b)", // number
    "(\\b[A-Za-z_][A-Za-z0-9_]*\\b)", // identifier/keyword
  ].join("|"),
  "gm"
);

function classify(token: string): string | null {
  if (token.startsWith("//") || token.startsWith("#") || token.startsWith("/*")) {
    return "text-text-tertiary italic";
  }
  if (
    (token.startsWith("'") && token.endsWith("'")) ||
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("`") && token.endsWith("`"))
  ) {
    return "text-success";
  }
  if (/^\d+(\.\d+)?$/.test(token)) {
    return "text-warning";
  }
  if (KEYWORDS.has(token)) {
    return "text-accent";
  }
  return null;
}

export function highlightCode(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(code.slice(lastIndex, match.index));
    }
    const token = match[0];
    const className = classify(token);
    nodes.push(
      className ? (
        <span key={key++} className={className}>
          {token}
        </span>
      ) : (
        token
      )
    );
    lastIndex = match.index + token.length;
  }

  if (lastIndex < code.length) {
    nodes.push(code.slice(lastIndex));
  }

  return nodes;
}
