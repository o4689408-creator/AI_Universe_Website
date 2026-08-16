import type { ArticleInput } from "@/types/admin";
import type { ArticleImage, QuizQuestionData } from "@/types/content";

/**
 * Parses a <form>'s FormData into an ArticleInput. Kept dependency-free
 * (no server-only imports) so it can run both server-side (the actual
 * save Server Action) and client-side (the editor's autosave effect
 * reads the surrounding form's live FormData to build its payload) —
 * one field-name mapping, not two that could drift apart.
 */
/**
 * Parses a JSON array serialized into a hidden `<input>` by a
 * data-driven field (ImageListField, QuizEditorField). Defaults to `[]`
 * on anything unexpected — missing input, empty string, malformed JSON,
 * or valid JSON that isn't an array — rather than throwing, so a
 * corrupted value in one field can never take down the rest of a save.
 * lib/admin/validation.ts is what actually enforces shape and bounds;
 * this function's only job is "never crash the parse."
 */
function parseJsonArray(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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
    images: parseJsonArray(formData.get("images")) as ArticleImage[],
    quiz: parseJsonArray(formData.get("quiz")) as QuizQuestionData[],
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
