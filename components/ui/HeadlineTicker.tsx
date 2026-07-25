import Link from "next/link";
import type { TopicMeta } from "@/types/content";

interface HeadlineTickerProps {
  topics: TopicMeta[];
}

/**
 * A slim, always-visible newsroom-style ticker. Pure CSS animation
 * (the `marquee` keyframe in tailwind.config.ts) — no JS, no library.
 * The topics list is duplicated once so the loop point is seamless;
 * pausing on hover is a single CSS rule (group-hover + animation-play-state),
 * no scroll/interval logic needed.
 */
export function HeadlineTicker({ topics }: HeadlineTickerProps) {
  if (topics.length === 0) return null;

  const items = [...topics, ...topics];

  return (
    <div className="group overflow-hidden border-y border-border-subtle bg-bg-surface-1">
      <div className="flex items-stretch">
        <span className="flex shrink-0 items-center gap-2 border-r border-border-subtle bg-bg-surface-2 px-4 py-2.5 text-label uppercase text-accent">
          <PulseDot />
          Latest AI
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-10 py-2.5 group-hover:[animation-play-state:paused]">
            {items.map((topic, index) => (
              <Link
                key={`${topic.slug}-${index}`}
                href={`/topics/${topic.slug}`}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap px-2 text-body-sm text-text-secondary transition-colors duration-fast hover:text-text-primary"
              >
                <span className="text-text-tertiary">{topic.category}</span>
                <span aria-hidden="true">—</span>
                <span>{topic.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PulseDot() {
  return (
    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
    </span>
  );
}
