import type { SourceLink } from "@/types/content";

interface SourcesListProps {
  sources: SourceLink[];
}

/**
 * Renders id="source-1", "source-2", etc. (1-indexed, in array order)
 * so <Cite index={1} /> markers in the article body can link directly
 * to the matching entry here.
 */
export function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-9 border-t border-border-subtle pt-6">
      <h2 className="text-heading-4 font-semibold text-text-primary">
        Sources &amp; further reading
      </h2>
      <ol className="mt-4 flex flex-col gap-2">
        {sources.map((source, index) => (
          <li
            key={source.url}
            id={`source-${index + 1}`}
            className="scroll-mt-24 text-body-sm text-text-secondary"
          >
            <span className="text-text-tertiary">{index + 1}.</span>{" "}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
