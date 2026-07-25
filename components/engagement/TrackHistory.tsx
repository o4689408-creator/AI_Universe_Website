"use client";

import { useEffect } from "react";
import { useReadingHistory } from "@/lib/hooks/useReadingHistory";

export function TrackHistory({ slug }: { slug: string }) {
  const { recordView } = useReadingHistory();

  useEffect(() => {
    recordView(slug);
    // recordView is stable (useCallback with no deps that change per
    // render) — only slug should trigger a re-record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
