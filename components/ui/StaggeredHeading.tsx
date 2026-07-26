import { cn } from "@/lib/utils";

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
    <span className={cn("break-words", className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            className="inline-block opacity-0 animate-blur-in-up will-change-[filter,transform,opacity]"
            style={{ animationDelay: `${startDelayMs + index * staggerMs}ms` }}
          >
            {word}
          </span>
          {/* A genuine space as a sibling text node (not trapped inside
              the inline-block span, and not a non-breaking space) —
              this is what gives the browser an actual line-wrap
              opportunity between words. Previously this used a
              non-breaking space glued inside each preceding span with
              zero whitespace between spans in the DOM, which meant the
              entire heading had no valid wrap point anywhere and was
              forced onto a single line regardless of viewport width —
              a real, confirmed cause of mobile horizontal overflow. */}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
