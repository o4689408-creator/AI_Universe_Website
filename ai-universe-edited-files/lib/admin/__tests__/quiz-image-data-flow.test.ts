import { describe, it, expect } from "vitest";
import { parseArticleFormData } from "@/lib/admin/form-parsing";
import { validateArticleInput, ArticleValidationError } from "@/lib/admin/validation";
import type { ArticleInput } from "@/types/admin";
import type { QuizQuestionData } from "@/types/content";

/**
 * Covers the part of "Admin editor → database → article → quiz
 * component → rendered image" (Task 5/14) that doesn't require a live
 * MongoDB connection: does data typed into the admin form's hidden JSON
 * inputs (exactly what ImageListField/QuizEditorField produce) actually
 * survive parseArticleFormData → validateArticleInput intact, with the
 * right things accepted and the right things rejected?
 *
 * What this does NOT cover: the actual MongoDB write/read round-trip
 * (createArticle/updateArticle/articleDocToTopicMeta) and the real
 * rendered page — this environment has no live database. See the final
 * report's limitations section.
 */
function baseFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    title: "Test Article",
    slug: "test-article",
    subtitle: "A subtitle",
    summary: "A short summary of the article.",
    category: "AI Models",
    tags: "test",
    content: "Some body content.",
    heroImageUrl: "https://images.example.com/hero.jpg",
  };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

/** validateArticleInput throws ArticleValidationError (with .fieldErrors) rather than returning an errors object when anything is invalid — this normalizes both branches to a plain Record for tests to assert against. */
function fieldErrors(input: ArticleInput): Record<string, string> {
  try {
    validateArticleInput(input);
    return {};
  } catch (error) {
    if (error instanceof ArticleValidationError) return error.fieldErrors;
    throw error;
  }
}

describe("admin quiz/image data flow (parse + validate, no live DB)", () => {
  it("parses a quiz option's image URL from the admin form's hidden JSON input all the way through to ArticleInput", () => {
    const quiz: QuizQuestionData[] = [
      {
        question: "What does this test?",
        correctIndex: 0,
        correctExplanation: "The pipeline.",
        incorrectExplanation: "Try again.",
        options: [
          {
            text: "The data pipeline",
            imageUrl: "https://images.example.com/pipeline.png",
            imageAlt: "A pipeline diagram",
          },
          { text: "Nothing" },
        ],
      },
    ];
    const fd = baseFormData({ quiz: JSON.stringify(quiz) });

    const input = parseArticleFormData(fd);

    expect(input.quiz).toHaveLength(1);
    expect(input.quiz?.[0]?.options[0]?.imageUrl).toBe("https://images.example.com/pipeline.png");
    expect(input.quiz?.[0]?.options[0]?.imageAlt).toBe("A pipeline diagram");
    expect(fieldErrors(input).quiz).toBeUndefined();
  });

  it("parses the images gallery array from its hidden JSON input", () => {
    const fd = baseFormData({
      images: JSON.stringify([
        { id: "a", url: "https://images.example.com/one.jpg", alt: "One", caption: "First" },
        { id: "b", url: "https://images.example.com/two.jpg", alt: "Two" },
      ]),
    });

    const input = parseArticleFormData(fd);

    expect(input.images).toHaveLength(2);
    expect(input.images?.[1]?.url).toBe("https://images.example.com/two.jpg");
    expect(fieldErrors(input).images).toBeUndefined();
  });

  it("defaults to an empty array rather than throwing when the hidden input is missing or malformed JSON", () => {
    const missing = parseArticleFormData(baseFormData());
    expect(missing.quiz).toEqual([]);
    expect(missing.images).toEqual([]);

    const malformed = parseArticleFormData(baseFormData({ quiz: "{not valid json" }));
    expect(malformed.quiz).toEqual([]);
  });

  it("rejects a quiz whose marked-correct option doesn't exist — this is the save-time twin of the runtime QuizSeries guard", () => {
    const quiz: QuizQuestionData[] = [
      {
        question: "Broken",
        correctIndex: 4,
        correctExplanation: "n/a",
        incorrectExplanation: "n/a",
        options: [{ text: "A" }, { text: "B" }],
      },
    ];
    const input = parseArticleFormData(baseFormData({ quiz: JSON.stringify(quiz) }));

    expect(fieldErrors(input).quiz).toMatch(/invalid/i);
  });

  it("rejects more than 15 images and more than 10 quiz questions", () => {
    const tooManyImages = Array.from({ length: 16 }, (_, i) => ({
      id: String(i),
      url: `https://images.example.com/${i}.jpg`,
      alt: "",
    }));
    const tooManyQuestions: QuizQuestionData[] = Array.from({ length: 11 }, (_, i) => ({
      question: `Q${i}`,
      correctIndex: 0,
      correctExplanation: "n/a",
      incorrectExplanation: "n/a",
      options: [{ text: "A" }, { text: "B" }],
    }));

    const input = parseArticleFormData(
      baseFormData({ images: JSON.stringify(tooManyImages), quiz: JSON.stringify(tooManyQuestions) })
    );
    const errors = fieldErrors(input);

    expect(errors.images).toMatch(/15/);
    expect(errors.quiz).toMatch(/10/);
  });

  it("does not block saving when an optional option image is simply absent", () => {
    const quiz: QuizQuestionData[] = [
      {
        question: "Text-only options are fine",
        correctIndex: 1,
        correctExplanation: "Yes.",
        incorrectExplanation: "No.",
        options: [{ text: "No" }, { text: "Yes" }],
      },
    ];
    const input = parseArticleFormData(baseFormData({ quiz: JSON.stringify(quiz) }));
    expect(fieldErrors(input).quiz).toBeUndefined();
  });

  it("rejects a malformed (non-empty but invalid) image URL rather than silently accepting it", () => {
    const input = parseArticleFormData(
      baseFormData({ images: JSON.stringify([{ id: "a", url: "not-a-url", alt: "" }]) })
    );
    expect(fieldErrors(input).images).toBeDefined();
  });

  it("tolerates an empty in-progress image row (no URL typed yet) without blocking the save", () => {
    const input = parseArticleFormData(
      baseFormData({ images: JSON.stringify([{ id: "a", url: "", alt: "" }]) })
    );
    expect(fieldErrors(input).images).toBeUndefined();
  });
});
