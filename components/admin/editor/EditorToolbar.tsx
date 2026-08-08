"use client";

import { cn } from "@/lib/utils";

export interface ToolbarAction {
  label: string;
  shortcut?: string;
  onClick: () => void;
  icon: React.ReactNode;
}

/**
 * Wraps or prefixes the textarea's current selection with Markdown
 * syntax and restores focus + a sensible new cursor position. This is
 * the whole "Rich Text Editor" mechanism here — deliberately NOT a
 * contentEditable/ProseMirror-style WYSIWYG (this project has zero
 * editor dependencies today, and pulling one in for this would be the
 * single biggest architectural addition in the whole CMS for a payoff
 * that a Markdown toolbar mostly already delivers). Toolbar buttons +
 * live preview + keyboard shortcuts is the same interaction model as
 * GitHub's comment box or Obsidian's source mode — genuinely fast to
 * use once you know the shortcuts, and the underlying storage stays
 * plain, robust, diffable Markdown.
 */
export function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = before
): { value: string; selectionStart: number; selectionEnd: number } {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const newValue = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);

  return selected
    ? { value: newValue, selectionStart: selectionStart + before.length, selectionEnd: selectionStart + before.length + selected.length }
    : { value: newValue, selectionStart: selectionStart + before.length, selectionEnd: selectionStart + before.length };
}

export function prefixLines(
  textarea: HTMLTextAreaElement,
  prefix: string | ((lineIndex: number) => string)
): { value: string; selectionStart: number; selectionEnd: number } {
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  let lineEnd = value.indexOf("\n", selectionEnd);
  if (lineEnd === -1) lineEnd = value.length;

  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const prefixed = lines
    .map((line, i) => `${typeof prefix === "function" ? prefix(i) : prefix}${line}`)
    .join("\n");

  const newValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  const addedLength = prefixed.length - block.length;

  return { value: newValue, selectionStart: lineStart, selectionEnd: lineEnd + addedLength };
}

export function EditorToolbar({ actions }: { actions: ToolbarAction[] }) {
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-border-subtle bg-bg-surface-2/50 px-2 py-1.5"
    >
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          onClick={action.onClick}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast",
            "hover:bg-bg-surface-3 hover:text-text-primary"
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}

// Small inline icon set — matches the rest of the project's approach
// (no icon library dependency; see components/layout/Logo.tsx, ThemeToggle.tsx).
export const ToolbarIcons = {
  Bold: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M4 2.5h4.2a2.4 2.4 0 0 1 0 4.8H4V2.5ZM4 7.7h4.7a2.5 2.5 0 0 1 0 5H4V7.7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
  ),
  Italic: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M6.5 2.5h5M4.5 13.5h5M9.5 2.5l-3 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
  ),
  H2: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M1.5 3v10M6 3v10M1.5 8H6M14.5 6.5c0-1.1-.8-2-2-2s-2 .8-2 2M10.5 13c1.5-1.3 3.7-2.8 3.9-4.2M10.5 13h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  H3: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M1.5 3v10M6 3v10M1.5 8H6M10.7 5c.3-.9 1.1-1.5 2-1.5 1.1 0 2 .8 2 1.8 0 .8-.5 1.3-1 1.5.6.2 1.2.8 1.2 1.7 0 1.1-1 1.9-2.2 1.9-.9 0-1.8-.5-2.1-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  Link: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M6.5 9.5 9.5 6.5M6.7 4.3l.9-.9a2.5 2.5 0 0 1 3.5 3.5l-.9.9M9.3 11.7l-.9.9a2.5 2.5 0 0 1-3.5-3.5l.9-.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
  ),
  Code: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  Quote: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M3 6.5c0-1.7 1-2.8 2.5-3M3 6.5v3.2h3V6.7H3ZM9 6.5c0-1.7 1-2.8 2.5-3M9 6.5v3.2h3V6.7H9Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
  ),
  BulletList: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><circle cx="2.5" cy="4" r="1" fill="currentColor" /><circle cx="2.5" cy="8" r="1" fill="currentColor" /><circle cx="2.5" cy="12" r="1" fill="currentColor" /><path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
  ),
  NumberList: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><text x="0.5" y="5.2" fontSize="4" fill="currentColor">1</text><text x="0.5" y="9.2" fontSize="4" fill="currentColor">2</text><text x="0.5" y="13.2" fontSize="4" fill="currentColor">3</text></svg>
  ),
  Image: () => (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><circle cx="5.5" cy="6.5" r="1" fill="currentColor" /><path d="M3 11.5 6.5 8l2 2 2.5-3 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
  ),
};
