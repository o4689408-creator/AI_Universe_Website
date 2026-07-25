import type { Author } from "@/types/content";

export function AuthorBio({ author }: { author: Author }) {
  return (
    <div className="mt-9 flex items-start gap-4 rounded-lg border border-border-subtle bg-bg-surface-1 p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-muted text-body-sm font-semibold text-accent"
        aria-hidden="true"
      >
        {author.name.charAt(0)}
      </div>
      <div>
        <p className="text-body-sm font-medium text-text-primary">
          {author.name}
        </p>
        <p className="text-body-sm text-text-tertiary">{author.title}</p>
        {author.bio && (
          <p className="mt-2 text-body-sm text-text-secondary">{author.bio}</p>
        )}
      </div>
    </div>
  );
}
