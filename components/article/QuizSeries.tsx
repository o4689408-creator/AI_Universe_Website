"use client";

import { Children, isValidElement, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { playCorrectSound, playIncorrectSound, playCompletionSound } from "@/lib/quiz-sound";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import type { QuizQuestionData } from "@/types/content";

const MAX_QUESTIONS = 10;

interface QuizQuestionProps {
  question: string;
  correctIndex: number | string;
  correctExplanation: string;
  incorrectExplanation: string;
  questionImageUrl?: string;
  questionImageAlt?: string;
  explanationImageUrl?: string;
  explanationImageAlt?: string;
  children?: ReactNode;
}

/**
 * Pure data-carrier — a `<QuizQuestion>` renders nothing on its own.
 * `<QuizSeries>` reads each child's props directly (title, explanation
 * text, image URLs, correctIndex) rather than expecting an
 * `options={[...]}` array literal — array-literal MDX props have
 * already caused a real build-time prerender failure in this project
 * (see the comment on Quiz.tsx), so every quiz data shape here is
 * expressed through props + children, the pattern proven to compile
 * reliably. `correctIndex` follows the same fixed convention as
 * `<Quiz>`: a quoted string in MDX (`correctIndex="1"`), not a JSX
 * numeric expression.
 */
export function QuizQuestion(_props: QuizQuestionProps): null {
  return null;
}

interface ParsedQuestion {
  question: string;
  correctIndex: number;
  correctExplanation: string;
  incorrectExplanation: string;
  questionImageUrl?: string;
  questionImageAlt?: string;
  explanationImageUrl?: string;
  explanationImageAlt?: string;
  options: { label: ReactNode; imageUrl?: string; imageAlt?: string }[];
}

interface QuestionParseError {
  index: number;
  reason: string;
}

interface ParsedQuizData {
  questions: ParsedQuestion[];
  errors: QuestionParseError[];
}

/**
 * Validates and normalizes one question's `correctIndex` against its
 * actual option count. This is the guard that was missing before: the
 * quoted-string convention (see Quiz.tsx's doc comment) fixes the one
 * specific historical cause — a bare numeric JSX expression compiling to
 * `undefined` — but it never checked the *result*. A missing prop, a
 * typo'd string ("1O" instead of "10"), or an index left stale after
 * reordering options would all still produce `NaN` or an out-of-range
 * number, and `selected === correctIndex` is false for every option in
 * every one of those cases too — the exact same "correct answer marked
 * wrong" symptom, just from a different mistake. Rather than trust the
 * input shape, we check whether the resolved index actually points at one
 * of this question's real options, and refuse to render the question at
 * all if it doesn't — a quiz that's missing one broken question is far
 * better than a quiz that silently can never be answered correctly.
 */
function isValidCorrectIndex(correctIndex: number, optionCount: number): boolean {
  return Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < optionCount;
}

function parseQuestions(children: ReactNode): ParsedQuizData {
  const questionElements = Children.toArray(children).filter(isValidElement);
  const questions: ParsedQuestion[] = [];
  const errors: QuestionParseError[] = [];

  questionElements.slice(0, MAX_QUESTIONS).forEach((el, index) => {
    const props = el.props as QuizQuestionProps;
    const correctIndex =
      typeof props.correctIndex === "string" ? Number.parseInt(props.correctIndex, 10) : props.correctIndex;

    const options = Children.toArray(props.children)
      .filter(isValidElement)
      .map((optionEl) => {
        const optionProps = optionEl.props as { children?: ReactNode; imageUrl?: string; imageAlt?: string };
        return { label: optionProps.children, imageUrl: optionProps.imageUrl, imageAlt: optionProps.imageAlt };
      });

    if (!isValidCorrectIndex(correctIndex, options.length)) {
      errors.push({
        index,
        reason: `correctIndex ${JSON.stringify(props.correctIndex)} isn't a valid option index for "${
          props.question ?? "(missing question text)"
        }" — this question has ${options.length} option${options.length === 1 ? "" : "s"} (valid range: 0–${Math.max(
          options.length - 1,
          0
        )}).`,
      });
      return;
    }

    questions.push({
      question: props.question,
      correctIndex,
      correctExplanation: props.correctExplanation,
      incorrectExplanation: props.incorrectExplanation,
      questionImageUrl: props.questionImageUrl,
      questionImageAlt: props.questionImageAlt,
      explanationImageUrl: props.explanationImageUrl,
      explanationImageAlt: props.explanationImageAlt,
      options,
    });
  });

  return { questions, errors };
}

/**
 * Same validation as parseQuestions, for the CMS/data-driven path
 * (`<QuizSeries questions={...} />`) — one shared invariant, two entry
 * points, so a CMS article's quiz can never silently misgrade any more
 * than an MDX article's can.
 */
function normalizeQuestionData(data: QuizQuestionData[]): ParsedQuizData {
  const questions: ParsedQuestion[] = [];
  const errors: QuestionParseError[] = [];

  data.slice(0, MAX_QUESTIONS).forEach((q, index) => {
    if (!isValidCorrectIndex(q.correctIndex, q.options.length)) {
      errors.push({
        index,
        reason: `correctIndex ${q.correctIndex} isn't a valid option index for "${q.question}" — this question has ${
          q.options.length
        } option${q.options.length === 1 ? "" : "s"} (valid range: 0–${Math.max(q.options.length - 1, 0)}).`,
      });
      return;
    }

    questions.push({
      question: q.question,
      correctIndex: q.correctIndex,
      correctExplanation: q.correctExplanation,
      incorrectExplanation: q.incorrectExplanation,
      questionImageUrl: q.questionImageUrl,
      questionImageAlt: q.questionImageAlt,
      explanationImageUrl: q.explanationImageUrl,
      explanationImageAlt: q.explanationImageAlt,
      options: q.options.map((o) => ({ label: o.text, imageUrl: o.imageUrl, imageAlt: o.imageAlt })),
    });
  });

  return { questions, errors };
}

/** Development-only, loudly visible — the previous bug required adding a temporary debug `console.log` during a real build to even notice. This renders in its place instead, so a malformed question is impossible to miss while writing or previewing an article. Never rendered in production; a broken question is simply omitted there rather than shown to readers. */
function QuizConfigErrors({ errors, compact }: { errors: QuestionParseError[]; compact?: boolean }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-error/40 bg-error/10 p-4 text-body-sm text-text-primary",
        compact ? "mb-4" : "my-8"
      )}
    >
      <p className="font-semibold text-error">
        Quiz configuration {errors.length === 1 ? "issue" : "issues"} — visible in development only
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-text-secondary">
        {errors.map((e) => (
          <li key={e.index}>
            Question {e.index + 1}: {e.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Answer {
  selectedIndex: number;
  isCorrect: boolean;
}

function resultMessage(score: number, total: number): string {
  const pct = score / total;
  if (pct >= 0.9) return "AI Expert Mode unlocked! 🚀";
  if (pct >= 0.7) return "Excellent work! You're building strong AI knowledge. 🧠";
  if (pct >= 0.5) return "Good progress! A little more exploration and you'll be flying. 🚀";
  return "Great attempt! Every wrong answer is another thing you've learned. Keep exploring! 💡";
}

const CORRECT_MESSAGES = ["🎉 Excellent!", "✨ You got it!", "🧠 Brilliant!", "🔥 Nailed it!"];
const INCORRECT_MESSAGES = ["Almost! 💡", "Good try! Keep going 🚀", "Not quite — here's the idea..."];

function pickMessage(list: string[], seed: number): string {
  return list[seed % list.length]!;
}

export function QuizSeries({
  children,
  questions: questionsData,
}: {
  children?: ReactNode;
  /**
   * Data-driven alternative to `children` — for CMS-authored articles,
   * whose body is plain Markdown with no MDX/JSX support (see
   * lib/admin/render-markdown.ts), so their quiz lives as a structured
   * field on the article document instead of inline `<QuizQuestion>`
   * elements. app/topics/[slug]/page.tsx passes this directly for CMS
   * articles; MDX articles keep authoring via `children` exactly as
   * before — `children` is only parsed when `questions` is absent, so
   * both paths share this one component instead of a second one.
   */
  questions?: QuizQuestionData[];
}) {
  const parsed = useMemo(
    () =>
      questionsData && questionsData.length > 0 ? normalizeQuestionData(questionsData) : parseQuestions(children),
    [children, questionsData]
  );
  const questions = parsed.questions;
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<"question" | "results">("question");
  const continueMarkerRef = useRef<HTMLDivElement>(null);
  const handleRipple = useRipple();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (total === 0) {
    // Previously this was a silent `return null` no matter what went
    // wrong, which is exactly why the original bug needed a temporary
    // debug log during a real build to even notice. In development, a
    // config problem is shown right where the quiz would be instead.
    // Production still fails closed and silent — readers never see a
    // broken quiz, just no quiz.
    if (process.env.NODE_ENV !== "production" && parsed.errors.length > 0) {
      return <QuizConfigErrors errors={parsed.errors} />;
    }
    return null;
  }

  const current = questions[currentIndex]!;
  const isAnswered = selected !== null;
  const isCorrect = selected === current.correctIndex;

  function handleSelect(optionIndex: number) {
    if (isAnswered) return;
    setSelected(optionIndex);
    const correct = optionIndex === current.correctIndex;
    setAnswers((prev) => [...prev, { selectedIndex: optionIndex, isCorrect: correct }]);

    // Sound always plays now — it's still only ever triggered from this
    // click handler, so the browser's "user gesture required" autoplay
    // rule is already satisfied without a separate visible opt-in toggle.
    if (correct) {
      playCorrectSound();
    } else {
      playIncorrectSound();
      setShakeIndex(optionIndex);
      setTimeout(() => setShakeIndex(null), 450);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= total) {
      setPhase("results");
      playCompletionSound();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
  }

  function handleRetry() {
    setCurrentIndex(0);
    setAnswers([]);
    setSelected(null);
    setPhase("question");
  }

  function handleContinue() {
    continueMarkerRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  const score = answers.filter((a) => a.isCorrect).length;
  const progressPct = ((currentIndex + (isAnswered ? 1 : 0)) / total) * 100;

  return (
    <div className="my-8">
      <AnimatedReveal variant="scale-in">
        <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent-muted/60 via-bg-surface-1/95 to-bg-surface-1/95 p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-accent/[0.16] blur-[80px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-accent/[0.10] blur-[70px]"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-5">
            <span className="flex w-fit items-center gap-2 rounded-full bg-accent-muted px-3 py-1 text-label font-semibold uppercase tracking-wide text-accent">
              🧠 Knowledge Check
            </span>

            {process.env.NODE_ENV !== "production" && parsed.errors.length > 0 && (
              <QuizConfigErrors errors={parsed.errors} compact />
            )}

            {phase === "question" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-label text-text-tertiary">
                    <span>
                      Question {currentIndex + 1} / {total}
                    </span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-slow ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div key={currentIndex} className={cn(!prefersReducedMotion && "animate-fade-up")}>
                  {current.questionImageUrl && (
                    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl bg-bg-surface-2">
                      <Image
                        src={current.questionImageUrl}
                        alt={current.questionImageAlt ?? ""}
                        fill
                        sizes="(min-width: 1100px) 700px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <h4 className="text-body-lg font-semibold leading-snug text-text-primary">{current.question}</h4>

                  <div
                    className={cn(
                      "mt-4 grid gap-2.5",
                      current.options.some((o) => o.imageUrl) ? "sm:grid-cols-2" : "grid-cols-1"
                    )}
                  >
                    {current.options.map((option, optionIndex) => {
                      const isSelectedOption = selected === optionIndex;
                      const isCorrectOption = optionIndex === current.correctIndex;
                      const showAsCorrect = isAnswered && isCorrectOption;
                      const showAsWrong = isAnswered && isSelectedOption && !isCorrectOption;

                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelect(optionIndex)}
                          onPointerDown={handleRipple}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border text-left text-body-sm font-medium transition-all duration-base ease-out",
                            option.imageUrl ? "flex flex-col" : "flex items-center gap-2.5 px-4 py-3.5",
                            !isAnswered &&
                              "border-border-subtle bg-bg-surface-1 text-text-primary hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow-accent",
                            showAsCorrect && "border-success/50 bg-success/10 text-success",
                            showAsWrong && "border-error/50 bg-error/10 text-error",
                            isAnswered && !showAsCorrect && !showAsWrong && "border-border-subtle opacity-50",
                            shakeIndex === optionIndex && !prefersReducedMotion && "animate-shake"
                          )}
                        >
                          {option.imageUrl && (
                            <span className="relative block aspect-video w-full overflow-hidden bg-bg-surface-2">
                              <Image
                                src={option.imageUrl}
                                alt={option.imageAlt ?? ""}
                                fill
                                sizes="(min-width: 1100px) 350px, 50vw"
                                className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
                              />
                            </span>
                          )}
                          <span className={cn("flex items-center gap-2.5", option.imageUrl && "px-4 py-3")}>
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-label font-semibold transition-colors duration-base",
                                showAsCorrect && "border-success bg-success text-white",
                                showAsWrong && "border-error bg-error text-white",
                                !isAnswered &&
                                  "border-border-subtle text-text-tertiary group-hover:border-accent/40 group-hover:text-accent"
                              )}
                            >
                              {showAsCorrect ? "✓" : showAsWrong ? "✕" : String.fromCharCode(65 + optionIndex)}
                            </span>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={cn(
                        "relative mt-4 flex items-start gap-2.5 rounded-xl border px-4 py-3.5 text-body-sm animate-fade-up",
                        isCorrect
                          ? "border-success/30 bg-success/10 text-text-secondary"
                          : "border-border-subtle bg-bg-surface-2 text-text-secondary"
                      )}
                    >
                      {isCorrect && !prefersReducedMotion && (
                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                          <ConfettiBurst count={14} />
                        </span>
                      )}
                      <div className="flex flex-col gap-2">
                        <p>
                          <span className="font-semibold text-text-primary">
                            {isCorrect
                              ? pickMessage(CORRECT_MESSAGES, currentIndex)
                              : pickMessage(INCORRECT_MESSAGES, currentIndex)}
                          </span>{" "}
                          {isCorrect ? current.correctExplanation : current.incorrectExplanation}
                        </p>
                        {current.explanationImageUrl && (
                          <span className="relative block aspect-video w-full max-w-xs overflow-hidden rounded-lg bg-bg-surface-2">
                            <Image
                              src={current.explanationImageUrl}
                              alt={current.explanationImageAlt ?? ""}
                              fill
                              sizes="320px"
                              className="object-cover"
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {isAnswered && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-body-sm font-semibold text-white transition-all duration-fast ease-out hover:opacity-90"
                    >
                      {currentIndex + 1 >= total ? "See Results" : "Next Question"}
                      <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className={cn("flex flex-col items-center gap-4 py-2 text-center", !prefersReducedMotion && "animate-fade-up")}>
                {!prefersReducedMotion && (
                  <span className="relative flex h-10 w-10 items-center justify-center">
                    <ConfettiBurst count={28} />
                  </span>
                )}
                <h4 className="text-heading-4 font-semibold text-text-primary">🎉 Quiz Complete!</h4>
                <p className="text-display-2-mobile font-semibold text-accent">
                  {score} / {total}
                </p>
                <p className="text-body-sm text-text-tertiary">{Math.round((score / total) * 100)}% correct</p>
                <p className="max-w-sm text-body-sm text-text-secondary">{resultMessage(score, total)}</p>

                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {answers.map((answer, i) => (
                    <span
                      key={i}
                      title={`Question ${i + 1}: ${answer.isCorrect ? "correct" : "incorrect"}`}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-label font-semibold",
                        answer.isCorrect ? "bg-success/15 text-success" : "bg-error/15 text-error"
                      )}
                    >
                      {answer.isCorrect ? "✓" : "✕"}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded-lg border border-border-subtle px-5 py-2.5 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="rounded-lg bg-accent px-5 py-2.5 text-body-sm font-semibold text-white transition-opacity duration-fast hover:opacity-90"
                  >
                    Continue Reading
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AnimatedReveal>
      <div ref={continueMarkerRef} aria-hidden="true" />
    </div>
  );
}


