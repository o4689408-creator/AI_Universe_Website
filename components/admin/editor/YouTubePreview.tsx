"use client";

import { useMemo } from "react";
import { parseYouTubeVideoId } from "@/lib/admin/validation";

export function YouTubePreview({ url }: { url: string }) {
  const videoId = useMemo(() => (url.trim() ? parseYouTubeVideoId(url) : null), [url]);

  if (!url.trim()) return null;

  if (!videoId) {
    return (
      <p className="text-label text-text-tertiary">Paste a valid YouTube URL to see a live preview.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle">
      <div className="relative aspect-video w-full bg-bg-surface-2">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video preview"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
