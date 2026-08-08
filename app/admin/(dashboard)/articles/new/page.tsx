import { ArticleForm } from "@/components/admin/ArticleForm";
import { getAllTopics } from "@/lib/content";
import { authors } from "@/lib/authors";
import { listCategories } from "@/lib/admin/categories";
import { listTags } from "@/lib/admin/tags";

export default async function NewArticlePage() {
  const [topics, managedCategories, managedTags] = await Promise.all([
    getAllTopics(),
    listCategories(),
    listTags(),
  ]);
  const categories = Array.from(new Set([...managedCategories.map((c) => c.name), ...topics.map((t) => t.category)])).sort();
  const tagSuggestions = Array.from(new Set(managedTags.map((t) => t.name))).sort();
  const existingTopics = topics.map((t) => ({ title: t.title, slug: t.slug }));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-heading-3 font-semibold tracking-tight text-text-primary">New Article</h1>
        <p className="mt-1 text-body-sm text-text-tertiary">
          Paste your title, article, image URL, and YouTube URL, then publish.
        </p>
      </div>

      <ArticleForm
        categories={categories}
        tagSuggestions={tagSuggestions}
        authors={Object.values(authors)}
        existingTopics={existingTopics}
      />
    </div>
  );
}
