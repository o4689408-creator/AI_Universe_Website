import type { ArticleInput } from "@/types/admin";

/**
 * Parses a <form>'s FormData into an ArticleInput. Kept dependency-free
 * (no server-only imports) so it can run both server-side (the actual
 * save Server Action) and client-side (the editor's autosave effect
 * reads the surrounding form's live FormData to build its payload) —
 * one field-name mapping, not two that could drift apart.
 */
export function parseArticleFormData(formData: FormData): ArticleInput {
  const tagsRaw = String(formData.get("tags") ?? "");
  const readTimeRaw = formData.get("readTimeMinutes");

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    subtitle: String(formData.get("subtitle") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    category: String(formData.get("category") ?? ""),
    tags: tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    content: String(formData.get("content") ?? ""),
    heroImageUrl: String(formData.get("heroImageUrl") ?? ""),
    featuredImageUrl: String(formData.get("featuredImageUrl") ?? "") || undefined,
    youtubeUrl: String(formData.get("youtubeUrl") ?? "") || undefined,
    authorId: String(formData.get("authorId") ?? "") || undefined,
    readTimeMinutes: readTimeRaw ? Number(readTimeRaw) : undefined,
    featured: formData.get("featured") === "on",
    trending: formData.get("trending") === "on",
    seoTitle: String(formData.get("seoTitle") ?? "") || undefined,
    metaDescription: String(formData.get("metaDescription") ?? "") || undefined,
    canonicalUrl: String(formData.get("canonicalUrl") ?? "") || undefined,
    ogTitle: String(formData.get("ogTitle") ?? "") || undefined,
    ogDescription: String(formData.get("ogDescription") ?? "") || undefined,
    ogImageUrl: String(formData.get("ogImageUrl") ?? "") || undefined,
    twitterImageUrl: String(formData.get("twitterImageUrl") ?? "") || undefined,
    scheduledFor: String(formData.get("scheduledFor") ?? "") || undefined,
  };
}
