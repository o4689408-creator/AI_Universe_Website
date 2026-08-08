import { listCategories } from "@/lib/admin/categories";
import { createCategoryAction, renameCategoryAction, deleteCategoryAction } from "@/lib/admin/actions/taxonomy-actions";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { Badge } from "@/components/admin/Badge";

interface PageProps {
  searchParams: { success?: string; error?: string };
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const categories = await listCategories();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-heading-3 font-semibold tracking-tight text-text-primary">Categories</h1>
        <p className="mt-1 text-body-sm text-text-tertiary">
          Organize articles into categories. Renaming updates every article using it automatically.
        </p>
      </div>

      <FlashBanner success={searchParams.success} error={searchParams.error} />

      <form action={createCategoryAction} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="New category name"
          className="flex-1 rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2.5 text-body-sm font-medium text-white transition-opacity duration-fast hover:opacity-90"
        >
          Add
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-subtle p-12 text-center">
          <p className="text-body-sm text-text-tertiary">No categories yet.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-1/40 backdrop-blur-md">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-text-primary">{category.name}</span>
                <Badge tone={category.usageCount > 0 ? "accent" : "neutral"}>
                  {category.usageCount} article{category.usageCount === 1 ? "" : "s"}
                </Badge>
                {category.mdxUsageCount > 0 && (
                  <Badge tone="neutral">{category.mdxUsageCount} MDX</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <form action={renameCategoryAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={category.id} />
                  <input
                    name="name"
                    defaultValue={category.name}
                    className="w-40 rounded-md border border-border-subtle bg-bg-surface-2 px-2.5 py-1.5 text-body-sm text-text-primary outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-border-subtle px-2.5 py-1.5 text-label font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
                  >
                    Rename
                  </button>
                </form>

                <form action={deleteCategoryAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={category.id} />
                  {category.usageCount > 0 && (
                    <select
                      name="reassignTo"
                      className="rounded-md border border-border-subtle bg-bg-surface-2 px-2 py-1.5 text-label text-text-secondary outline-none focus:border-accent"
                    >
                      <option value="">Reassign to…</option>
                      {categories
                        .filter((c) => c.id !== category.id)
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  )}
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
