import { listMedia } from "@/lib/admin/media";
import { addMediaAction, deleteMediaAction } from "@/lib/admin/actions/taxonomy-actions";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { CopyUrlButton } from "@/components/admin/CopyUrlButton";

interface PageProps {
  searchParams: { success?: string; error?: string; q?: string };
}

export default async function MediaPage({ searchParams }: PageProps) {
  const media = await listMedia(searchParams.q);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-3 font-semibold tracking-tight text-text-primary">Media Library</h1>
        <p className="mt-1 text-body-sm text-text-tertiary">
          Reusable image URLs — paste a URL, preview it, add alt text, and it&apos;s ready to reuse across articles.
        </p>
      </div>

      <FlashBanner success={searchParams.success} error={searchParams.error} />

      <form action={addMediaAction} className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-surface-1/50 p-6 backdrop-blur-md">
        <h2 className="text-body-lg font-semibold text-text-primary">Add an image</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="media-url" className="text-body-sm font-medium text-text-secondary">
              Image URL
            </label>
            <input
              id="media-url"
              name="url"
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              className="rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="media-alt" className="text-body-sm font-medium text-text-secondary">
              Alt text
            </label>
            <input
              id="media-alt"
              name="altText"
              required
              placeholder="A short description of the image"
              className="rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-caption" className="text-body-sm font-medium text-text-secondary">
            Caption <span className="text-text-tertiary">(optional)</span>
          </label>
          <input
            id="media-caption"
            name="caption"
            placeholder="Shown under the image, if your article uses captions"
            className="rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-md bg-accent px-4 py-2.5 text-body-sm font-medium text-white transition-opacity duration-fast hover:opacity-90"
        >
          Add to library
        </button>
      </form>

      <form method="GET" className="flex">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by alt text or URL…"
          className="w-full max-w-sm rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2 text-body-sm text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
        />
      </form>

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-subtle p-12 text-center">
          <p className="text-body-sm text-text-tertiary">No images in the library yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-1/40 backdrop-blur-md"
            >
              <div className="aspect-video w-full bg-bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.altText} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="truncate text-body-sm font-medium text-text-primary" title={item.altText}>
                  {item.altText}
                </p>
                {item.caption && <p className="truncate text-label text-text-tertiary">{item.caption}</p>}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <CopyUrlButton url={item.url} />
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-border-subtle px-2.5 py-1.5 text-label font-medium text-text-tertiary transition-colors duration-fast hover:border-error/30 hover:text-error"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
