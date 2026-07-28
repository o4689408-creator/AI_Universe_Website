import Link from "next/link";
import type { ResolvedLearningPath } from "@/lib/learning-paths";

interface LearningPathSectionProps {
  path: ResolvedLearningPath;
}

export function LearningPathSection({ path }: LearningPathSectionProps) {
  if (path.steps.length === 0) return null;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-1">
        <span className="text-label uppercase text-accent">Featured Learning Path</span>
        <h2 className="text-heading-3 font-semibold text-text-primary">{path.title}</h2>
        <p className="text-body-sm text-text-secondary">{path.description}</p>
      </div>

      <ol className="flex flex-col gap-0 rounded-lg border border-border-subtle bg-bg-surface-1">
        {path.steps.map((topic, index) => (
          <li key={topic.slug}>
            <Link
              href={`/topics/${topic.slug}`}
              className="group flex items-center gap-4 px-5 py-4 transition-colors duration-fast hover:bg-bg-surface-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-body-sm text-text-tertiary group-hover:border-accent group-hover:text-accent">
                {index + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-body-sm font-medium text-text-primary group-hover:text-accent">
                  {topic.title}
                </span>
                <span className="text-body-sm text-text-tertiary">{topic.category}</span>
              </div>
            </Link>
            {index < path.steps.length - 1 && (
              <div className="ml-[2.35rem] h-4 w-px bg-border-subtle" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
