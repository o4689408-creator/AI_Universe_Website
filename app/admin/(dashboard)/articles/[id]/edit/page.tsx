import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getArticleDocById } from "@/lib/admin/articles";
import { getAllTopics } from "@/lib/content";
import { authors } from "@/lib/authors";
import { listCategories } from "@/lib/admin/categories";
import { listTags } from "@/lib/admin/tags";

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, topics, managedCategories, managedTags] = await Promise.all([
    getArticleDocById(params.id),
    getAllTopics(),
    listCategories(),
    listTags(),
  ]);
  if (!article) notFound();

  const categories = Array.from(new Set([...managedCategories.map((c) => c.name), ...topics.map((t) => t.category)])).sort();
  const tagSuggestions = Array.from(new Set(managedTags.map((t) => t.name))).sort();
  const existingTopics = topics.filter((t) => t.slug !== article.slug).map((t) => ({ title: t.title, slug: t.slug }));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-heading-3 font-semibold tracking-tight text-text-primary">Edit Article</h1>
        <p className="mt-1 text-body-sm text-text-tertiary">/{article.slug}</p>
      </div>

      <ArticleForm
        categories={categories}
        tagSuggestions={tagSuggestions}
        authors={Object.values(authors)}
        existingTopics={existingTopics}
        initialValues={{
          id: article._id.toString(),
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle,
          summary: article.summary,
          category: article.category,
          tags: article.tags,
          content: article.content,
          heroImageUrl: article.heroImageUrl,
          featuredImageUrl: article.featuredImageUrl ?? "",
          youtubeUrl: article.youtubeUrl ?? "",
          authorId: article.authorId,
          readTimeMinutes: article.readTimeMinutes,
          featured: article.featured,
          trending: article.trending,
          status: article.status,
          scheduledFor: article.scheduledFor ?? "",
          seoTitle: article.seoTitle ?? "",
          metaDescription: article.metaDescription ?? "",
          canonicalUrl: article.canonicalUrl ?? "",
          ogTitle: article.ogTitle ?? "",
          ogDescription: article.ogDescription ?? "",
          ogImageUrl: article.ogImageUrl ?? "",
          twitterImageUrl: article.twitterImageUrl ?? "",
        }}
      />
    </div>
  );
}
