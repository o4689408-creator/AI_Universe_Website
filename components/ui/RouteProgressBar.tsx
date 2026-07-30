"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A slim, animated top-of-page progress bar during route changes —
 * the same signature detail Linear/Vercel-style products use so a
 * navigation always feels immediate and "alive," even though Next.js
 * App Router navigations are typically fast enough to need no
 * spinner. Rendered once in the root layout, so it's present on
 * every page without each route needing to think about it.
 *
 * How it detects "a navigation happened": App Router doesn't expose a
 * navigation-start event in this Next version, so instead this
 * listens for clicks on same-origin, non-modifier-key link clicks
 * (the earliest reliable "a navigation is about to happen" signal),
 * starts the bar, then clears it once `usePathname()`/`useSearchParams()`
 * actually change — i.e. the new route has committed.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const trickleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousKey = useRef(`${pathname}?${searchParams.toString()}`);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;

      const url = new URL(anchor.href, window.location.href);
      const isSameOrigin = url.origin === window.location.origin;
      const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;
      if (!isSameOrigin || isSamePage) return;

      startProgress();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function startProgress() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (trickleTimer.current) clearInterval(trickleTimer.current);

    setVisible(true);
    setProgress(0.08);

    // "Trickle" toward (but never reach) 90% while waiting for the
    // real navigation to commit — a classic top-loader pattern that
    // reads as continuous progress without ever promising a false 100%.
    trickleTimer.current = setInterval(() => {
      setProgress((current) => (current >= 0.9 ? current : current + (0.9 - current) * 0.12));
    }, 200);
  }

  // Fires once the actual route has changed — completes and hides the bar.
  useEffect(() => {
    const currentKey = `${pathname}?${searchParams.toString()}`;
    if (currentKey === previousKey.current) return;
    previousKey.current = currentKey;

    if (trickleTimer.current) clearInterval(trickleTimer.current);
    setProgress(1);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (trickleTimer.current) clearInterval(trickleTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[200] h-[2.5px] w-full"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease-out" }}
    >
      <div
        className="h-full bg-gradient-to-r from-accent via-accent-hover to-accent shadow-glow-accent"
        style={{
          width: `${progress * 100}%`,
          transition: "width 300ms ease-out",
        }}
      />
    </div>
  );
}
