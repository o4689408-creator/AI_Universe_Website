interface StaggeredHeadingProps {
  text: string;
  className?: string;
  /** Base delay before the first word starts, in ms. */
  startDelayMs?: number;
  /** Gap between each word's reveal, in ms. */
  staggerMs?: number;
}

/**
 * Splits `text` into per-word <span>s, each animating in with the
 * blur-in-up keyframe (opacity + blur + translateY), staggered by
 * `staggerMs` per word. This is purely a visual splitting technique —
 * the words are still plain text nodes inside the heading, so screen
 * readers read the full sentence normally; nothing here uses
 * aria-hidden or removes text content.
 *
 * A Server Component deliberately: this needs no interactivity or
 * client state, just CSS animation triggered on mount — keeping it
 * server-rendered avoids an unnecessary client boundary on the single
 * most prominent piece of text on the site.
 */
export function StaggeredHeading({
  text,
  className,
  startDelayMs = 0,
  staggerMs = 80,
}: StaggeredHeadingProps) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block opacity-0 animate-blur-in-up will-change-[filter,transform,opacity]"
          style={{ animationDelay: `${startDelayMs + index * staggerMs}ms` }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
