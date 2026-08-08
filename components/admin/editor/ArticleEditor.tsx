"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorToolbar, ToolbarIcons, wrapSelection, prefixLines } from "@/components/admin/editor/EditorToolbar";
import { EditorStatsBar } from "@/components/admin/editor/StatsBar";
import { InternalLinkAssistant, type LinkableTopic } from "@/components/admin/editor/InternalLinkAssistant";
import { LinkChecker } from "@/components/admin/editor/LinkChecker";
import { renderPreviewAction } from "@/lib/admin/actions/preview-actions";
import { autosaveArticleAction } from "@/lib/admin/actions/article-actions";
import { parseArticleFormData } from "@/lib/admin/form-parsing";
import { cn } from "@/lib/utils";

type ViewMode = "write" | "split" | "preview";
type AutosaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DEBOUNCE_MS = 2500;
const PREVIEW_DEBOUNCE_MS = 500;

export function ArticleEditor({
  id,
  initialContent,
  existingTopics,
}: {
  id?: string;
  initialContent: string;
  existingTopics: LinkableTopic[];
}) {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>("write");
  const [fullscreen, setFullscreen] = useState(false);
  const [previewNode, setPreviewNode] = useState<React.ReactNode>(null);
  const [showLinkChecker, setShowLinkChecker] = useState(false);

  const [articleId, setArticleId] = useState(id);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const previewTimer = useRef<ReturnType<typeof setTimeout>>();

  // --- Toolbar actions: operate on the textarea's current selection ---
  const applyEdit = useCallback((transform: (ta: HTMLTextAreaElement) => { value: string; selectionStart: number; selectionEnd: number }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const result = transform(textarea);
    setContent(result.value);
    setDirty(true);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const newValue = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
    setContent(newValue);
    setDirty(true);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = selectionStart + text.length;
      textarea.setSelectionRange(pos, pos);
    });
  }, []);

  const toolbarActions = [
    { label: "Bold", shortcut: "Ctrl+B", icon: <ToolbarIcons.Bold />, onClick: () => applyEdit((ta) => wrapSelection(ta, "**")) },
    { label: "Italic", shortcut: "Ctrl+I", icon: <ToolbarIcons.Italic />, onClick: () => applyEdit((ta) => wrapSelection(ta, "_")) },
    { label: "Heading 2", icon: <ToolbarIcons.H2 />, onClick: () => applyEdit((ta) => prefixLines(ta, "## ")) },
    { label: "Heading 3", icon: <ToolbarIcons.H3 />, onClick: () => applyEdit((ta) => prefixLines(ta, "### ")) },
    { label: "Link", shortcut: "Ctrl+K", icon: <ToolbarIcons.Link />, onClick: () => applyEdit((ta) => wrapSelection(ta, "[", "](https://)")) },
    { label: "Code", icon: <ToolbarIcons.Code />, onClick: () => applyEdit((ta) => wrapSelection(ta, "`")) },
    { label: "Quote", icon: <ToolbarIcons.Quote />, onClick: () => applyEdit((ta) => prefixLines(ta, "> ")) },
    { label: "Bulleted list", icon: <ToolbarIcons.BulletList />, onClick: () => applyEdit((ta) => prefixLines(ta, "- ")) },
    { label: "Numbered list", icon: <ToolbarIcons.NumberList />, onClick: () => applyEdit((ta) => prefixLines(ta, (i) => `${i + 1}. `)) },
  ];

  // --- Keyboard shortcuts ---
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod) return;

    if (event.key === "b") {
      event.preventDefault();
      applyEdit((ta) => wrapSelection(ta, "**"));
    } else if (event.key === "i") {
      event.preventDefault();
      applyEdit((ta) => wrapSelection(ta, "_"));
    } else if (event.key === "k") {
      event.preventDefault();
      applyEdit((ta) => wrapSelection(ta, "[", "](https://)"));
    } else if (event.key === "s") {
      event.preventDefault();
      textareaRef.current?.form?.querySelector<HTMLButtonElement>('button[value="draft"]')?.click();
    } else if (event.key === "Enter") {
      event.preventDefault();
      textareaRef.current?.form?.querySelector<HTMLButtonElement>('button[value="published"]')?.click();
    }
  }

  // --- Jump to heading (from the TOC in the stats bar) ---
  function jumpToHeading(headingText: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const index = content.indexOf(headingText);
    if (index === -1) return;

    const linesBefore = content.slice(0, index).split("\n").length;
    const totalLines = Math.max(1, content.split("\n").length);

    setViewMode((mode) => (mode === "preview" ? "write" : mode));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(index, index + headingText.length);
      textarea.scrollTop = (textarea.scrollHeight * (linesBefore - 1)) / totalLines;
    });
  }

  // --- Live preview (debounced) ---
  useEffect(() => {
    if (viewMode === "write") return;
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      renderPreviewAction(content).then((result) => setPreviewNode(result.node));
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(previewTimer.current);
  }, [content, viewMode]);

  // --- Autosave (debounced) + draft recovery is implicit: reloading
  // /admin/articles/[id]/edit always loads whatever was last autosaved. ---
  useEffect(() => {
    if (!dirty) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const form = textareaRef.current?.form;
      if (!form) return;

      const input = parseArticleFormData(new FormData(form));
      if (!input.title.trim()) return; // nothing worth saving yet

      setAutosaveStatus("saving");
      const result = await autosaveArticleAction(articleId, input);
      if (result.error) {
        setAutosaveStatus("error");
        return;
      }
      if (result.id) {
        setArticleId(result.id);
        // Keep the surrounding form's hidden `id` field in sync so a
        // manual "Save Draft"/"Publish" click updates this same
        // document instead of creating a second one.
        const idField = form.elements.namedItem("id");
        if (idField instanceof HTMLInputElement) idField.value = result.id;
      }
      setAutosaveStatus("saved");
      setLastSavedAt(new Date());
      setDirty(false);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(autosaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  // --- Warn on tab close with unsaved changes ---
  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-1/50 backdrop-blur-md",
        fullscreen && "fixed inset-0 z-[150] rounded-none"
      )}
    >
      <div className="flex items-center justify-between border-b border-border-subtle bg-bg-surface-2/30 px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-border-subtle bg-bg-surface-1 p-0.5">
            {(["write", "split", "preview"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded px-2.5 py-1 text-label font-medium capitalize transition-colors duration-fast",
                  viewMode === mode ? "bg-accent/10 text-accent" : "text-text-tertiary hover:text-text-primary"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <InternalLinkAssistant topics={existingTopics} onInsert={insertAtCursor} />
          <button
            type="button"
            onClick={() => setShowLinkChecker((v) => !v)}
            className="text-label font-medium text-text-tertiary transition-colors duration-fast hover:text-text-primary"
          >
            Check links
          </button>
        </div>

        <div className="flex items-center gap-3">
          <AutosaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            title="Toggle fullscreen"
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors duration-fast hover:bg-bg-surface-3 hover:text-text-primary"
          >
            {fullscreen ? (
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M9.5 6.5 14 2M6.5 9.5 2 14M9.5 6.5h3.5V3M6.5 9.5H3v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>
        </div>
      </div>

      {viewMode !== "preview" && <EditorToolbar actions={toolbarActions} />}

      {showLinkChecker && (
        <div className="border-b border-border-subtle p-4">
          <LinkChecker content={content} />
        </div>
      )}

      <div className={cn("flex", fullscreen ? "flex-1 overflow-hidden" : "")}>
        {(viewMode === "write" || viewMode === "split") && (
          <textarea
            ref={textareaRef}
            name="content"
            required
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full resize-none border-0 bg-transparent p-5 font-mono text-body-sm leading-relaxed text-text-primary outline-none",
              fullscreen ? "flex-1 overflow-y-auto" : "min-h-[420px]",
              viewMode === "split" && "border-r border-border-subtle md:w-1/2"
            )}
            placeholder="## A section heading&#10;&#10;Your article, in Markdown. Paste from anywhere — plain text just works."
          />
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={cn(
              "prose-reading overflow-y-auto p-5",
              fullscreen ? "flex-1" : "min-h-[420px]",
              viewMode === "split" && "md:w-1/2"
            )}
          >
            {previewNode ?? <p style={{ opacity: 0.5 }}>Nothing to preview yet.</p>}
          </div>
        )}
      </div>

      {!fullscreen && <EditorStatsBar content={content} onJumpToHeading={jumpToHeading} />}
    </div>
  );
}

function AutosaveIndicator({ status, lastSavedAt }: { status: AutosaveStatus; lastSavedAt: Date | null }) {
  if (status === "idle") return null;

  return (
    <span className="flex items-center gap-1.5 text-label text-text-tertiary">
      {status === "saving" && (
        <>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Saving…
        </>
      )}
      {status === "saved" && lastSavedAt && (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </>
      )}
      {status === "error" && (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-error" />
          Autosave failed
        </>
      )}
    </span>
  );
}
