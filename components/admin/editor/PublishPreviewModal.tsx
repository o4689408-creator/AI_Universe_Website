"use client";

import { useEffect, useState } from "react";
import { renderPreviewAction } from "@/lib/admin/actions/preview-actions";

type PreviewSize = "desktop" | "tablet" | "mobile";

const sizes: Record<PreviewSize, { width: number; label: string }> = {
  desktop: { width: 1280, label: "Desktop" },
  tablet: { width: 768, label: "Tablet" },
  mobile: { width: 390, label: "Mobile" },
};

export function PublishPreviewModal({
  open,
  onClose,
  title,
  subtitle,
  heroImageUrl,
  content,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  content: string;
}) {
  const [size, setSize] = useState<PreviewSize>("desktop");
  const [node, setNode] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    renderPreviewAction(content).then((result) => {
      if (!cancelled) {
        setNode(result.node);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, content]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex flex-col bg-bg-base/95 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-surface-1 p-1">
          {(Object.keys(sizes) as PreviewSize[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSize(key)}
              className={`rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors duration-fast ${
                size === key ? "bg-accent/10 text-accent" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {sizes[key].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-2 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:bg-bg-surface-2 hover:text-text-primary"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 justify-center overflow-y-auto p-8">
        <div
          className="h-fit shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-base shadow-lg transition-all duration-base ease-out"
          style={{ width: sizes[size].width, maxWidth: "100%" }}
        >
          {heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
          )}
          <div className="p-8">
            <h1 className="text-heading-2 font-semibold tracking-tight text-text-primary">
              {title || "Untitled article"}
            </h1>
            {subtitle && <p className="mt-2 text-body-lg text-text-secondary">{subtitle}</p>}

            <div className="prose-reading mt-8">
              {loading ? <p className="text-text-tertiary">Rendering preview…</p> : node}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
