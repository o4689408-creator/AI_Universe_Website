import { listTags } from "@/lib/admin/tags";
import { createTagAction, renameTagAction, deleteTagAction } from "@/lib/admin/actions/taxonomy-actions";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { Badge } from "@/components/admin/Badge";

interface PageProps {
  searchParams: { success?: string; error?: string; q?: string };
}

export default async function TagsPage({ searchParams }: PageProps) {
  const tags = await listTags(searchParams.q);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-heading-3 font-semibold tracking-tight text-text-primary">Tags</h1>
        <p className="mt-1 text-body-sm text-text-tertiary">
          Deleting a tag removes it from every article that has it — tags are freely editable, unlike categories.
        </p>
      </div>

      <FlashBanner success={searchParams.success} error={searchParams.error} />

      <div className="flex gap-2">
        <form action={createTagAction} className="flex flex-1 gap-2">
          <input
            name="name"
            required
            placeholder="New tag name"
            className="flex-1 rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2.5 text-body-sm font-medium text-white transition-opacity duration-fast hover:opacity-90"
          >
            Add
          </button>
        </form>
      </div>

      <form method="GET" className="flex">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search tags…"
          className="w-full rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2 text-body-sm text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
        />
      </form>

      {tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-subtle p-12 text-center">
          <p className="text-body-sm text-text-tertiary">No tags found.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-1/40 backdrop-blur-md">
          {tags.map((tag) => (
            <div key={tag.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-text-primary">{tag.name}</span>
                <Badge tone={tag.usageCount > 0 ? "accent" : "neutral"}>
                  {tag.usageCount} article{tag.usageCount === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <form action={renameTagAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={tag.id} />
                  <input
                    name="name"
                    defaultValue={tag.name}
                    className="w-36 rounded-md border border-border-subtle bg-bg-surface-2 px-2.5 py-1.5 text-body-sm text-text-primary outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-border-subtle px-2.5 py-1.5 text-label font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
                  >
                    Rename
                  </button>
                </form>

                <form action={deleteTagAction}>
                  <input type="hidden" name="id" value={tag.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-border-subtle px-2.5 py-1.5 text-label font-medium text-text-tertiary transition-colors duration-fast hover:border-error/30 hover:text-error"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
