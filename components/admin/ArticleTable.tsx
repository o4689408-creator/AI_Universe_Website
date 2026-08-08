import Link from "next/link";
import { Badge } from "@/components/admin/Badge";
import { DeleteArticleForm } from "@/components/admin/DeleteArticleForm";
import { deleteArticleAction, setArticleStatusAction } from "@/lib/admin/actions/article-actions";
import { statusTone, statusLabel } from "@/components/admin/status";
import type { ArticleListItem } from "@/types/admin";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function ArticleTable({ articles }: { articles: ArticleListItem[] }) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle p-12 text-center">
        <p className="text-body-sm text-text-tertiary">No articles match these filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-1/40 backdrop-blur-md">
      {/* Desktop table */}
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-border-subtle text-label uppercase tracking-wide text-text-tertiary">
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Flags</th>
            <th className="px-5 py-3 font-medium">Updated</th>
            <th className="px-5 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr
              key={article.id}
              className="border-b border-border-subtle/60 text-body-sm last:border-0 hover:bg-bg-surface-2/40"
            >
              <td className="max-w-xs px-5 py-4">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="font-medium text-text-primary transition-colors duration-fast hover:text-accent"
                >
                  {article.title}
                </Link>
                <p className="mt-0.5 truncate text-text-tertiary">/{article.slug}</p>
              </td>
              <td className="px-5 py-4 text-text-secondary">{article.category}</td>
              <td className="px-5 py-4">
                <Badge tone={statusTone(article.status)}>{statusLabel(article.status)}</Badge>
                {article.status === "scheduled" && article.scheduledFor && (
                  <p className="mt-1 text-label text-text-tertiary">{formatDate(article.scheduledFor)}</p>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-1.5">
                  {article.featured && <Badge tone="accent">Featured</Badge>}
                  {article.trending && <Badge tone="warning">Trending</Badge>}
                </div>
              </td>
              <td className="px-5 py-4 text-text-tertiary">{formatDate(article.updatedAt)}</td>
              <td className="px-5 py-4">
                <RowActions article={article} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="flex flex-col divide-y divide-border-subtle/60 md:hidden">
        {articles.map((article) => (
          <div key={article.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="font-medium text-text-primary transition-colors duration-fast hover:text-accent"
                >
                  {article.title}
                </Link>
                <p className="mt-0.5 truncate text-body-sm text-text-tertiary">/{article.slug}</p>
              </div>
              <Badge tone={statusTone(article.status)}>{statusLabel(article.status)}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-body-sm text-text-tertiary">
              <span>{article.category}</span>
              <span>·</span>
              <span>{formatDate(article.updatedAt)}</span>
              {article.featured && <Badge tone="accent">Featured</Badge>}
              {article.trending && <Badge tone="warning">Trending</Badge>}
            </div>
            <RowActions article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RowActions({ article }: { article: ArticleListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={setArticleStatusAction}>
        <input type="hidden" name="id" value={article.id} />
        <input type="hidden" name="status" value={article.status === "published" ? "draft" : "published"} />
        <button
          type="submit"
          className="rounded-md border border-border-subtle px-3 py-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
        >
          {article.status === "published" ? "Unpublish" : "Publish"}
        </button>
      </form>
      <DeleteArticleForm id={article.id} action={deleteArticleAction} />
    </div>
  );
}
