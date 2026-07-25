import Link from "next/link";
import type { TopicMeta } from "@/types/content";

interface ArticleNavProps {
  previous: TopicMeta | null;
  next: TopicMeta | null;
}

export function ArticleNav({ previous, next }: ArticleNavProps) {
  if (!previous && !next) return null;

  return (
    <div className="mt-9 grid grid-cols-1 gap-4 border-t border-border-subtle pt-6 sm:grid-cols-2">
      {previous ? (
        <NavLink direction="Previous" topic={previous} align="left" />
      ) : (
        <div />
      )}
      {next ? <NavLink direction="Next" topic={next} align="right" /> : <div />}
    </div>
  );
}

function NavLink({
  direction,
  topic,
  align,
}: {
  direction: "Previous" | "Next";
  topic: TopicMeta;
  align: "left" | "right";
}) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={`group flex flex-col gap-1 rounded-lg border border-border-subtle p-4 transition-colors duration-fast hover:border-border ${
        align === "right" ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="text-label uppercase text-text-tertiary">
        {direction}
      </span>
      <span className="text-body-sm font-medium text-text-primary group-hover:text-accent">
        {topic.title}
      </span>
    </Link>
  );
}
