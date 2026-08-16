import type { ArticleInput } from "@/types/admin";
import type { QuizQuestionData } from "@/types/content";

export class ArticleValidationError extends Error {
  fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super("Article validation failed.");
    this.name = "ArticleValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const MAX_ARTICLE_IMAGES = 15;
const MAX_QUIZ_QUESTIONS = 10;
const MIN_QUIZ_OPTIONS = 2;
const MAX_QUIZ_OPTIONS = 6;

/**
 * Validates the whole quiz array at once and returns a single message
 * (or undefined if it's fine) rather than per-question field errors —
 * QuizEditorField doesn't currently have per-question error slots to
 * render into, so one clear top-of-section message is more useful than
 * errors that would otherwise go unseen.
 *
 * The correctIndex bounds check here is deliberately the same invariant
 * QuizSeries.tsx re-checks at render time (Number.isInteger, in range for
 * that question's actual option count) — this is what stops a malformed
 * quiz from ever being saved in the first place, rather than relying
 * solely on the runtime component to fail safely after the fact.
 */
function validateQuizQuestions(questions: QuizQuestionData[]): string | undefined {
  if (questions.length > MAX_QUIZ_QUESTIONS) {
    return `Maximum ${MAX_QUIZ_QUESTIONS} questions per quiz (found ${questions.length}).`;
  }

  for (const [i, q] of questions.entries()) {
    const label = `Question ${i + 1}`;

    if (!q.question?.trim()) return `${label}: the question text is required.`;
    if (!q.correctExplanation?.trim()) return `${label}: the "if correct" explanation is required.`;
    if (!q.incorrectExplanation?.trim()) return `${label}: the "if incorrect" explanation is required.`;

    if (!Array.isArray(q.options) || q.options.length < MIN_QUIZ_OPTIONS) {
      return `${label}: at least ${MIN_QUIZ_OPTIONS} options are required.`;
    }
    if (q.options.length > MAX_QUIZ_OPTIONS) {
      return `${label}: maximum ${MAX_QUIZ_OPTIONS} options.`;
    }
    if (q.options.some((option) => !option.text?.trim())) {
      return `${label}: every option needs text.`;
    }
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      // This exact check, applied before saving rather than only at
      // render time, is what makes it structurally very hard to ever
      // reproduce the original "correct answer marked wrong" bug through
      // this editor — a malformed correctIndex simply can't be saved.
      return `${label}: the marked correct option is invalid — re-select it before saving.`;
    }
  }

  return undefined;
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

  if (input.images && input.images.length > MAX_ARTICLE_IMAGES) {
    errors.images = `Maximum ${MAX_ARTICLE_IMAGES} images per article (found ${input.images.length}).`;
  } else if (input.images?.some((image) => image.url?.trim() && !isLikelyUrl(image.url))) {
    // A row with no URL yet is a normal in-progress "slot", not an error —
    // only a URL that's actually been typed and is malformed is flagged.
    // lib/content.ts filters out any empty rows before they reach a reader.
    errors.images = "Every image needs a valid URL (starting with https://), or leave it blank to remove it.";
  }

  if (input.quiz) {
    const quizError = validateQuizQuestions(input.quiz);
    if (quizError) errors.quiz = quizError;
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
