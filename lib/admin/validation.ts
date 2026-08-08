import type { ArticleInput } from "@/types/admin";

export class ArticleValidationError extends Error {
  fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super("Article validation failed.");
    this.name = "ArticleValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const YOUTUBE_URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/** Extracts the 11-character YouTube video ID from any common YouTube URL shape. Returns null if the URL isn't recognized. */
export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const match = YOUTUBE_URL_PATTERN.exec(trimmed);
  return match?.[1] ?? null;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates an ArticleInput payload. Returns the same object back
 * (never mutates) so callers can chain `const clean = validateArticleInput(input)`.
 * Throws ArticleValidationError with per-field messages on failure —
 * the Admin form reads `.fieldErrors` to show inline errors next to
 * the right inputs instead of one generic banner.
 */
export function validateArticleInput(input: ArticleInput): ArticleInput {
  const errors: Record<string, string> = {};

  if (!input.title?.trim()) errors.title = "Title is required.";
  if (input.title && input.title.length > 160) errors.title = "Title is too long (max 160 characters).";

  if (!input.subtitle?.trim()) errors.subtitle = "Subtitle is required.";
  if (!input.summary?.trim()) errors.summary = "Summary is required.";
  if (input.summary && input.summary.length > 400) {
    errors.summary = "Summary is too long (max 400 characters).";
  }

  if (!input.category?.trim()) errors.category = "Category is required.";

  if (!input.content?.trim()) errors.content = "Article body can't be empty.";

  if (!input.heroImageUrl?.trim()) {
    errors.heroImageUrl = "Hero image URL is required.";
  } else if (!isLikelyUrl(input.heroImageUrl)) {
    errors.heroImageUrl = "Enter a valid image URL (starting with https://).";
  }

  if (input.featuredImageUrl && !isLikelyUrl(input.featuredImageUrl)) {
    errors.featuredImageUrl = "Enter a valid image URL (starting with https://).";
  }

  if (input.youtubeUrl?.trim() && !parseYouTubeVideoId(input.youtubeUrl)) {
    errors.youtubeUrl = "That doesn't look like a YouTube URL.";
  }

  if (input.slug?.trim() && !SLUG_PATTERN.test(input.slug.trim())) {
    errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens.";
  }

  if (input.seoTitle && input.seoTitle.length > 70) {
    errors.seoTitle = "Keep the SEO title under 70 characters so it doesn't get truncated in search results.";
  }
  if (input.metaDescription && input.metaDescription.length > 160) {
    errors.metaDescription = "Keep the meta description under 160 characters so it doesn't get truncated in search results.";
  }
  if (input.canonicalUrl && !isLikelyUrl(input.canonicalUrl)) {
    errors.canonicalUrl = "Enter a valid URL (starting with https://).";
  }
  if (input.ogImageUrl && !isLikelyUrl(input.ogImageUrl)) {
    errors.ogImageUrl = "Enter a valid image URL (starting with https://).";
  }
  if (input.twitterImageUrl && !isLikelyUrl(input.twitterImageUrl)) {
    errors.twitterImageUrl = "Enter a valid image URL (starting with https://).";
  }

  if (
    input.readTimeMinutes !== undefined &&
    (Number.isNaN(input.readTimeMinutes) || input.readTimeMinutes < 1 || input.readTimeMinutes > 999)
  ) {
    errors.readTimeMinutes = "Reading time must be between 1 and 999 minutes.";
  }

  if (Object.keys(errors).length > 0) throw new ArticleValidationError(errors);

  return input;
}

function isLikelyUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/** Average adult reading speed used to auto-calculate reading time when the admin leaves it blank. Still editable afterward. */
const WORDS_PER_MINUTE = 200;

export function estimateReadTimeMinutes(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
