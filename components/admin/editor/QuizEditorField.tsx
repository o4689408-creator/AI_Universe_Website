"use client";

import { useCallback, useId } from "react";
import { ImageUrlField } from "@/components/admin/editor/ImageUrlField";
import { cn } from "@/lib/utils";
import type { QuizOptionData, QuizQuestionData } from "@/types/content";

const MAX_QUESTIONS = 10;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const fieldClasses =
  "w-full rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent";
const labelClasses = "text-body-sm font-medium text-text-secondary";

function makeEmptyOption(): QuizOptionData {
  return { text: "" };
}

function makeEmptyQuestion(): QuizQuestionData {
  return {
    question: "",
    correctIndex: 0,
    correctExplanation: "",
    incorrectExplanation: "",
    options: [makeEmptyOption(), makeEmptyOption()],
  };
}

/**
 * Admin authoring UI for a CMS article's quiz — up to 10 questions, 2–6
 * options each, an optional image per option (reuses ImageUrlField, so
 * it gets the same live preview and reachability check as every other
 * image field), and the correct answer chosen with a radio button bound
 * to the option itself rather than a typed number.
 *
 * That last part matters beyond convenience: it's what makes the
 * original "correct answer marked wrong" bug structurally impossible to
 * reintroduce from this UI. There's no index to mistype, and removing or
 * reordering options keeps `correctIndex` pointing at the same option
 * (see removeOption below) instead of silently drifting to whatever now
 * occupies that position. QuizSeries.tsx still re-validates the result
 * defensively, but this editor is designed so that check should never
 * actually need to fire for anything authored here.
 *
 * Serializes to one hidden `<input name="quiz">` as JSON, read back out
 * by lib/admin/form-parsing.ts through the same save/autosave pipeline
 * as every other field — no separate save path for this one either.
 */
export function QuizEditorField({
  name,
  questions,
  onChange,
}: {
  name: string;
  questions: QuizQuestionData[];
  onChange: (questions: QuizQuestionData[]) => void;
}) {
  const updateQuestion = useCallback(
    (index: number, patch: Partial<QuizQuestionData>) => {
      onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
    },
    [questions, onChange]
  );

  const addQuestion = useCallback(() => {
    if (questions.length >= MAX_QUESTIONS) return;
    onChange([...questions, makeEmptyQuestion()]);
  }, [questions, onChange]);

  const removeQuestion = useCallback(
    (index: number) => {
      onChange(questions.filter((_, i) => i !== index));
    },
    [questions, onChange]
  );

  const moveQuestion = useCallback(
    (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= questions.length) return;
      const current = questions[index];
      const swapped = questions[target];
      if (!current || !swapped) return;
      const next = [...questions];
      next[index] = swapped;
      next[target] = current;
      onChange(next);
    },
    [questions, onChange]
  );

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name={name} value={JSON.stringify(questions)} />

      <div className="flex items-center justify-between">
        <div>
          <p className={labelClasses}>Quiz questions</p>
          <p className="text-label text-text-tertiary">
            Optional — aim for 5–10 questions that test real understanding of the article.
          </p>
        </div>
        <span className="text-label text-text-tertiary">
          {questions.length}/{MAX_QUESTIONS}
        </span>
      </div>

      {questions.length > 0 && (
        <ol className="flex flex-col gap-5">
          {questions.map((question, index) => (
            <QuestionEditor
              key={index}
              index={index}
              total={questions.length}
              question={question}
              onChange={(patch) => updateQuestion(index, patch)}
              onRemove={() => removeQuestion(index)}
              onMove={(direction) => moveQuestion(index, direction)}
            />
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={addQuestion}
        disabled={questions.length >= MAX_QUESTIONS}
        className="self-start rounded-md border border-border-subtle px-4 py-2 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add question
      </button>
    </div>
  );
}

function QuestionEditor({
  index,
  total,
  question,
  onChange,
  onRemove,
  onMove,
}: {
  index: number;
  total: number;
  question: QuizQuestionData;
  onChange: (patch: Partial<QuizQuestionData>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const groupId = useId();

  const updateOption = (optionIndex: number, patch: Partial<QuizOptionData>) => {
    onChange({ options: question.options.map((o, i) => (i === optionIndex ? { ...o, ...patch } : o)) });
  };

  const addOption = () => {
    if (question.options.length >= MAX_OPTIONS) return;
    onChange({ options: [...question.options, makeEmptyOption()] });
  };

  const removeOption = (optionIndex: number) => {
    if (question.options.length <= MIN_OPTIONS) return;
    const options = question.options.filter((_, i) => i !== optionIndex);
    // Keep correctIndex pointing at the same option it pointed at
    // before — not the same numeric position — so removing an option
    // before the correct one can't silently make a different option
    // "correct". If the correct option itself was just removed, fall
    // back to the first remaining one rather than leaving a stale index.
    let correctIndex = question.correctIndex;
    if (optionIndex === question.correctIndex) correctIndex = 0;
    else if (optionIndex < question.correctIndex) correctIndex = question.correctIndex - 1;
    onChange({ options, correctIndex });
  };

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-surface-2/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-semibold text-text-primary">Question {index + 1}</span>
        <div className="flex items-center gap-3 text-label font-medium text-text-tertiary">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="disabled:opacity-30"
            aria-label="Move question up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="disabled:opacity-30"
            aria-label="Move question down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-error transition-opacity duration-fast hover:opacity-80"
            aria-label={`Remove question ${index + 1}`}
          >
            Remove
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Question</span>
        <textarea
          value={question.question}
          onChange={(event) => onChange({ question: event.target.value })}
          rows={2}
          placeholder="What does the article explain about…?"
          className={cn(fieldClasses, "resize-y")}
        />
      </label>

      <fieldset className="flex flex-col gap-2.5">
        <legend className={cn(labelClasses, "mb-1")}>Options — select the correct one</legend>
        {question.options.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-bg-surface-1 p-3"
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name={`${groupId}-correct`}
                checked={question.correctIndex === optionIndex}
                onChange={() => onChange({ correctIndex: optionIndex })}
                aria-label={`Mark option ${optionIndex + 1} as correct`}
                className="h-4 w-4 shrink-0 border-border-subtle text-accent focus:ring-accent"
              />
              <input
                type="text"
                value={option.text}
                onChange={(event) => updateOption(optionIndex, { text: event.target.value })}
                placeholder={`Option ${optionIndex + 1}`}
                className={cn(fieldClasses, "flex-1")}
              />
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                disabled={question.options.length <= MIN_OPTIONS}
                className="shrink-0 text-label font-medium text-text-tertiary transition-colors duration-fast hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Remove option ${optionIndex + 1}`}
              >
                ✕
              </button>
            </div>
            <ImageUrlField
              id={`quiz-${groupId}-option-${optionIndex}-image`}
              name={`quiz-${groupId}-option-${optionIndex}-image`}
              label="Optional image"
              value={option.imageUrl ?? ""}
              onChange={(imageUrl) => updateOption(optionIndex, { imageUrl: imageUrl || undefined })}
              placeholder="Leave blank for a text-only option"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          disabled={question.options.length >= MAX_OPTIONS}
          className="self-start text-label font-medium text-accent transition-opacity duration-fast hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add option
        </button>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Explanation if correct</span>
          <textarea
            value={question.correctExplanation}
            onChange={(event) => onChange({ correctExplanation: event.target.value })}
            rows={2}
            className={cn(fieldClasses, "resize-y")}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Explanation if incorrect</span>
          <textarea
            value={question.incorrectExplanation}
            onChange={(event) => onChange({ incorrectExplanation: event.target.value })}
            rows={2}
            className={cn(fieldClasses, "resize-y")}
          />
        </label>
      </div>
    </li>
  );
}
