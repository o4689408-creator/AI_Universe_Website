"use client";

import { Children, isValidElement, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

interface QuizProps {
  /** e.g. "Question 1 of 2" — purely a label, no logic depends on it. */
  index?: number | string;
  total?: number | string;
  question: string;
  /**
   * Accepts a number or a numeric string. MDX articles MUST pass this
   * as a quoted string (`correctIndex="1"`), not a JSX numeric
   * expression (`correctIndex={1}`) — see the long comment below.
   */
  correctIndex: number | string;
  correctExplanation: string;
  incorrectExplanation: string;
  /** Pass <QuizOption>...</QuizOption> children, one per answer choice. */
  children?: ReactNode;
}

/**
 * A single interactive quiz question for the end of an article
 * section — colorful, glassmorphic, answered once per mount (no
 * "try again" reset; a quiz you can retry until you get it right
 * isn't really testing anything).
 *
 * Answer choices are passed as `<QuizOption>` children rather than an
 * `options={[...]}` array prop — matching the same children-based
 * pattern already used by Timeline/FAQSection/StatsGrid in this
 * codebase, which is the MDX prop shape proven to compile reliably
 * here (an array-literal prop value tripped a build-time prerender
 * error across every article using it).
 *
 * `correctIndex`/`index`/`total` are QUOTED STRINGS in every article's
 * MDX source (`correctIndex="1"`), not JSX numeric expressions
 * (`correctIndex={1}`) — this is a confirmed, verified fix for a real
 * bug, not a style choice. Numeric JSX expression-container props on
 * this component were compiling to `undefined`: a temporary debug log
 * added during a real `next build` showed `correctIndex`, `index`, and
 * `total` all arriving as `undefined` despite being written as
 * `{1}`/`{2}` in every article, while plain string attributes like
 * `question="..."` on the exact same element worked correctly. With
 * `correctIndex === undefined`, `selected === correctIndex` is false
 * for every possible answer — which is exactly the reported bug: every
 * option, including the genuinely correct one, always showed as wrong.
 * String attributes are unaffected, so this component accepts strings
 * (or real numbers, for any non-MDX caller) and coerces internally.
 */
export function Quiz({
  index,
  total,
  question,
  correctIndex,
  correctExplanation,
  incorrectExplanation,
  children,
}: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const handleRipple = useRipple();

  const correctIndexNum = typeof correctIndex === "string" ? Number.parseInt(correctIndex, 10) : correctIndex;
  const indexNum = typeof index === "string" ? Number.parseInt(index, 10) : index;
  const totalNum = typeof total === "string" ? Number.parseInt(total, 10) : total;

  const options = Children.toArray(children).filter(isValidElement);
  const isAnswered = selected !== null;
  const isCorrect = selected === correctIndexNum;

  function handleSelect(optionIndex: number) {
    if (isAnswered) return;
    setSelected(optionIndex);
    if (optionIndex !== correctIndexNum) {
      setShakeIndex(optionIndex);
      setTimeout(() => setShakeIndex(null), 450);
    }
  }

  return (
    <AnimatedReveal variant="scale-in">
      <div className="relative my-8 overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent-muted/60 via-bg-surface-1/95 to-bg-surface-1/95 p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-7">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-accent/[0.16] blur-[70px]"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-4">
          <span className="flex w-fit items-center gap-2 rounded-full bg-accent-muted px-3 py-1 text-label font-semibold uppercase tracking-wide text-accent">
            🧠 Quick Check
            {indexNum && totalNum ? ` · ${indexNum}/${totalNum}` : ""}
          </span>

          <h4 className="text-body-lg font-semibold leading-snug text-text-primary">{question}</h4>

          <div className="flex flex-col gap-2.5">
            {options.map((option, optionIndex) => {
              const isSelectedOption = selected === optionIndex;
              const isCorrectOption = optionIndex === correctIndexNum;
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
                    "group relative overflow-hidden rounded-xl border px-4 py-3.5 text-left text-body-sm font-medium transition-all duration-base ease-out",
                    !isAnswered &&
                      "border-border-subtle bg-bg-surface-1 text-text-primary hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow-accent",
                    showAsCorrect && "border-success/50 bg-success/10 text-success",
                    showAsWrong && "border-error/50 bg-error/10 text-error",
                    isAnswered && !showAsCorrect && !showAsWrong && "border-border-subtle opacity-50",
                    shakeIndex === optionIndex && "animate-shake"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-label font-semibold transition-colors duration-base",
                        showAsCorrect && "border-success bg-success text-white",
                        showAsWrong && "border-error bg-error text-white",
                        !isAnswered && "border-border-subtle text-text-tertiary group-hover:border-accent/40 group-hover:text-accent"
                      )}
                    >
                      {showAsCorrect ? "✓" : showAsWrong ? "✕" : String.fromCharCode(65 + optionIndex)}
                    </span>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={cn(
                "relative flex items-start gap-2.5 rounded-xl border px-4 py-3.5 text-body-sm animate-fade-up",
                isCorrect
                  ? "border-success/30 bg-success/10 text-text-secondary"
                  : "border-border-subtle bg-bg-surface-2 text-text-secondary"
              )}
            >
              {isCorrect && (
                <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <ConfettiBurst count={12} />
                </span>
              )}
              <p>
                <span className="font-semibold text-text-primary">
                  {isCorrect ? "Correct! " : "Not quite. "}
                </span>
                {isCorrect ? correctExplanation : incorrectExplanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedReveal>
  );
}

/** One answer choice inside a <Quiz> or <QuizQuestion>. Renders its children as the button label. `imageUrl`/`imageAlt` are read directly from this element's props by QuizSeries for image-based options; Quiz (single-question) renders text-only and ignores them. */
export function QuizOption({
  children,
}: {
  children?: ReactNode;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return <>{children}</>;
}
