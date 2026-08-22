/**
 * Requested reference for this treatment was a Pinterest pin (floating/
 * bubbling particles). Pinterest's robots.txt disallows automated
 * access entirely, and hotlinking a re-posted clip from its CDN even by
 * hand would carry real problems beyond that: no guarantee of the
 * original poster's rights to it, no stable long-term URL, no control
 * over file size/bandwidth on every page load, and no way to art-direct
 * it to this site's palette or motion restraint. This recreates the
 * requested feel — soft, glowing shapes drifting slowly upward — as a
 * fully original, lightweight CSS animation instead: no video file, no
 * external asset, the same design-token accent color as the rest of
 * the site, and complete control over subtlety.
 *
 * Pure CSS (no canvas, no per-frame JS) — deliberately cheaper than the
 * Hero's particle scene (components/ui/HeroSceneCanvas.tsx), since this
 * is meant as a quiet atmospheric touch elsewhere on the page, not a
 * second version of the Hero's more elaborate treatment. Bubble
 * positions/timings are derived deterministically from their index
 * (not Math.random()) specifically so server and client render
 * identically — no hydration mismatch.
 *
 * Renders nothing for prefers-reduced-motion — a slow decorative loop
 * is exactly the kind of effect that preference exists to opt out of,
 * and there's no static fallback worth showing in its place here.
 */
export function AmbientBubbles({ count = 10, className = "" }: { count?: number; className?: string }) {
  const bubbles = Array.from({ length: count }, (_, i) => {
    const size = 36 + ((i * 37) % 90);
    const left = (i * 53) % 100;
    const duration = 20 + ((i * 11) % 16);
    const delay = -((i * 7) % duration);
    const opacity = 0.05 + ((i * 13) % 7) / 100;
    return { key: i, size, left, duration, delay, opacity };
  });

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden ${className}`}
      aria-hidden="true"
    >
      {bubbles.map((bubble) => (
        <span
          key={bubble.key}
          className="absolute rounded-full bg-accent blur-2xl"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: "-15%",
            opacity: bubble.opacity,
            animationName: "bubble-rise",
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}
