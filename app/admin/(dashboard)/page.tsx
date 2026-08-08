import Link from "next/link";
import { getArticleStats, listArticlesForAdmin } from "@/lib/admin/articles";
import { listCategories } from "@/lib/admin/categories";
import { listTags } from "@/lib/admin/tags";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/ui/Button";
import { statusTone, statusLabel } from "@/components/admin/status";

export default async function AdminDashboardPage() {
  const [stats, recentResult, categories, tags] = await Promise.all([
    getArticleStats(),
    listArticlesForAdmin({ pageSize: 5 }),
    listCategories(),
    listTags(),
  ]);
  const recent = recentResult.items;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-3 font-semibold tracking-tight text-text-primary">Dashboard</h1>
          <p className="mt-1 text-body-sm text-text-tertiary">
            An overview of everything published through the CMS.
          </p>
        </div>
        <Button href="/admin/articles/new">New Article</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total articles" value={stats.total} />
        <StatCard label="Published" value={stats.published} tone="accent" />
        <StatCard label="Drafts" value={stats.draft} />
        <StatCard label="Ready for review" value={stats.ready} />
        <StatCard label="Scheduled" value={stats.scheduled} />
        <StatCard label="Featured" value={stats.featured} />
        <StatCard label="Trending" value={stats.trending} />
        <StatCard label="Categories" value={categories.length} />
        <StatCard label="Tags" value={tags.length} />
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-surface-1/50 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 className="text-body-lg font-semibold text-text-primary">Recently updated</h2>
          <Link
            href="/admin/articles"
            className="text-body-sm font-medium text-accent transition-opacity duration-fast hover:opacity-80"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-body-sm text-text-tertiary">
              No articles yet. Create your first one to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle/60">
            {recent.map((article) => (
              <li key={article.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="font-medium text-text-primary transition-colors duration-fast hover:text-accent"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-0.5 truncate text-body-sm text-text-tertiary">{article.category}</p>
                </div>
                <Badge tone={statusTone(article.status)}>{statusLabel(article.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
