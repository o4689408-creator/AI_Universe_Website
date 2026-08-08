import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  baseSearchParams,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  baseSearchParams: Record<string, string | undefined>;
}) {
  if (total === 0) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(total, page * pageSize);

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(baseSearchParams)) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const search = params.toString();
    return `/admin/articles${search ? `?${search}` : ""}`;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-body-sm text-text-tertiary">
      <p>
        Showing {rangeStart}–{rangeEnd} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-md border border-border-subtle px-3 py-1.5 font-medium transition-colors duration-fast ${
            page <= 1 ? "pointer-events-none opacity-40" : "text-text-secondary hover:border-border-strong hover:text-text-primary"
          }`}
        >
          Previous
        </Link>
        <span className="px-2">
          Page {page} of {totalPages}
        </span>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-md border border-border-subtle px-3 py-1.5 font-medium transition-colors duration-fast ${
            page >= totalPages ? "pointer-events-none opacity-40" : "text-text-secondary hover:border-border-strong hover:text-text-primary"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
