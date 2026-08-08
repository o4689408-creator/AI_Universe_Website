import { listArticlesForAdmin } from "@/lib/admin/articles";
import { listCategories } from "@/lib/admin/categories";
import { listTags } from "@/lib/admin/tags";
import { ArticleTable } from "@/components/admin/ArticleTable";
import { ArticleFilterBar } from "@/components/admin/ArticleFilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { Button } from "@/components/ui/Button";
import type { ArticleStatus } from "@/types/admin";

interface AdminArticlesPageProps {
  searchParams: {
    q?: string;
    status?: string;
    category?: string;
    tag?: string;
    featured?: string;
    trending?: string;
    page?: string;
    success?: string;
    error?: string;
  };
}

const VALID_STATUSES: ArticleStatus[] = ["draft", "ready", "scheduled", "published"];

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const status = VALID_STATUSES.includes(searchParams.status as ArticleStatus)
    ? (searchParams.status as ArticleStatus)
    : undefined;

  const [result, categories, tags] = await Promise.all([
    listArticlesForAdmin({
      query: searchParams.q,
      status,
      category: searchParams.category || undefined,
      tag: searchParams.tag || undefined,
      featured: searchParams.featured === "true" ? true : undefined,
      trending: searchParams.trending === "true" ? true : undefined,
      page,
      pageSize: 20,
    }),
    listCategories(),
    listTags(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-3 font-semibold tracking-tight text-text-primary">Articles</h1>
          <p className="mt-1 text-body-sm text-text-tertiary">
            {result.total} article{result.total === 1 ? "" : "s"} total.
          </p>
        </div>
        <Button href="/admin/articles/new">New Article</Button>
      </div>

      <FlashBanner success={searchParams.success} error={searchParams.error} />

      <ArticleFilterBar categories={categories.map((c) => c.name)} tags={tags.map((t) => t.name)} />

      <ArticleTable articles={result.items} />

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
        baseSearchParams={{
          q: searchParams.q,
          status: searchParams.status,
          category: searchParams.category,
          tag: searchParams.tag,
          featured: searchParams.featured,
          trending: searchParams.trending,
        }}
      />
    </div>
  );
}
