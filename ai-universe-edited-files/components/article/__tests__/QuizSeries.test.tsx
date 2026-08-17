import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizSeries } from "@/components/article/QuizSeries";
import type { QuizQuestionData } from "@/types/content";

vi.mock("@/lib/quiz-sound", () => ({
  playCorrectSound: vi.fn(),
  playIncorrectSound: vi.fn(),
  playCompletionSound: vi.fn(),
}));
import { playCorrectSound, playIncorrectSound, playCompletionSound } from "@/lib/quiz-sound";

// Real timers throughout, with a short injected delay (see the
// autoAdvanceDelayMs prop on QuizSeries) instead of vi.useFakeTimers() —
// vitest's fake timers and @testing-library/user-event's own internal
// waiting don't reliably compose even with delay:null, and chasing that
// compatibility issue isn't worth it when the component can just be
// asked to use a 40ms delay instead of 3200ms for a test.
const TEST_DELAY_MS = 40;

// Option buttons render a letter badge (A/B/C…) before the option text,
// which becomes "✓"/"✕" once answered — so a button's accessible name is
// always "<badge><text>", never just "<text>". Matchers below are
// end-anchored for exactly that reason.
function optionNamed(text: string): RegExp {
  return new RegExp(`${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
}

function threeQuestions(): QuizQuestionData[] {
  return [
    {
      question: "What is 2 + 2?",
      correctIndex: 1,
      correctExplanation: "Basic arithmetic.",
      incorrectExplanation: "The correct answer is 4.",
      options: [
        { text: "3" },
        { text: "4", imageUrl: "https://images.example.com/four.png", imageAlt: "The digit four" },
        { text: "5" },
      ],
    },
    {
      question: "What color is a clear daytime sky?",
      correctIndex: 0,
      correctExplanation: "Rayleigh scattering.",
      incorrectExplanation: "It's blue, due to Rayleigh scattering.",
      options: [{ text: "Blue" }, { text: "Green" }, { text: "Purple" }],
    },
    {
      question: "Is water wet?",
      correctIndex: 0,
      correctExplanation: "By most everyday definitions, yes.",
      incorrectExplanation: "Most everyday definitions say yes.",
      options: [{ text: "Yes" }, { text: "No" }],
    },
  ];
}

function renderQuiz(questions = threeQuestions()) {
  return render(<QuizSeries questions={questions} autoAdvanceDelayMs={TEST_DELAY_MS} />);
}

describe("QuizSeries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks the correct option correct, shows encouraging feedback, and plays the correct sound", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: optionNamed("4") }));

    expect(screen.getByText(/Basic arithmetic\./)).toBeInTheDocument();
    expect(playCorrectSound).toHaveBeenCalledTimes(1);
    expect(playIncorrectSound).not.toHaveBeenCalled();
  });

  it("marks a wrong option wrong, shows the correct option as correct, and plays the wrong sound — the correct answer must never be marked wrong", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: optionNamed("3") }));

    const wrongOption = screen.getByRole("button", { name: optionNamed("3") });
    const correctOption = screen.getByRole("button", { name: optionNamed("4") });
    // This is the exact case the original production bug got wrong: the
    // actually-correct option must show ✓, never ✕, once answered.
    expect(within(wrongOption).getByText("✕")).toBeInTheDocument();
    expect(within(correctOption).getByText("✓")).toBeInTheDocument();
    expect(screen.getByText(/The correct answer is 4\./)).toBeInTheDocument();
    expect(playIncorrectSound).toHaveBeenCalledTimes(1);
    expect(playCorrectSound).not.toHaveBeenCalled();
  });

  it("renders an image for an option that has one, and not for options that don't", () => {
    renderQuiz();

    const fourOption = screen.getByRole("button", { name: optionNamed("4") });
    expect(within(fourOption).getByAltText("The digit four")).toBeInTheDocument();

    const threeOption = screen.getByRole("button", { name: optionNamed("3") });
    expect(within(threeOption).queryByRole("img")).not.toBeInTheDocument();
  });

  it("locks the question after the first click — rapid repeated clicks on other options do nothing", async () => {
    const user = userEvent.setup();
    // A longer delay here specifically so the auto-advance timer can't
    // possibly fire mid-test and turn "still on question 1" into a false
    // pass for the wrong reason.
    render(<QuizSeries questions={threeQuestions()} autoAdvanceDelayMs={5000} />);

    await user.click(screen.getByRole("button", { name: optionNamed("3") })); // wrong, locks in
    await user.click(screen.getByRole("button", { name: optionNamed("4") })); // no-op — already answered
    await user.click(screen.getByRole("button", { name: optionNamed("5") })); // no-op

    expect(playIncorrectSound).toHaveBeenCalledTimes(1); // not 3
    expect(playCorrectSound).not.toHaveBeenCalled();
    expect(screen.getByText("Question 1 / 3")).toBeInTheDocument();
  });

  it("automatically advances to the next question after the delay, with no manual click", async () => {
    const user = userEvent.setup();
    renderQuiz();

    expect(screen.getByText("Question 1 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: optionNamed("4") }));

    await waitFor(() => expect(screen.getByText("Question 2 / 3")).toBeInTheDocument());
  });

  it("does not double-advance when the reader manually clicks Next before the auto-advance timer fires", async () => {
    const user = userEvent.setup();
    // A deliberately long delay: the manual click below must win the
    // race, and if the effect's cleanup didn't actually cancel the
    // pending timer, it would fire mid-test and silently skip question 2.
    render(<QuizSeries questions={threeQuestions()} autoAdvanceDelayMs={5000} />);

    await user.click(screen.getByRole("button", { name: optionNamed("4") }));
    await user.click(screen.getByRole("button", { name: /Next Question/i }));
    expect(screen.getByText("Question 2 / 3")).toBeInTheDocument();

    // Wait comfortably past where the (correctly cancelled) 5s timer
    // would have fired, confirming it didn't skip us to question 3.
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(screen.getByText("Question 2 / 3")).toBeInTheDocument();
  });

  it("walks through all three questions, shows the correct final score, and plays the completion sound exactly once", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: optionNamed("4") })); // correct
    await user.click(screen.getByRole("button", { name: /Next Question/i }));

    await user.click(screen.getByRole("button", { name: optionNamed("Green") })); // wrong
    await user.click(screen.getByRole("button", { name: /Next Question/i }));

    await user.click(screen.getByRole("button", { name: optionNamed("Yes") })); // correct
    await user.click(screen.getByRole("button", { name: /See Results/i }));

    expect(await screen.findByText("🎉 Quiz Complete!")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(playCompletionSound).toHaveBeenCalledTimes(1);
  });

  it("resets to question 1 with fully clean state when Try Again is clicked", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: optionNamed("4") }));
    await user.click(screen.getByRole("button", { name: /Next Question/i }));
    await user.click(screen.getByRole("button", { name: optionNamed("Green") }));
    await user.click(screen.getByRole("button", { name: /Next Question/i }));
    await user.click(screen.getByRole("button", { name: optionNamed("Yes") }));
    await user.click(screen.getByRole("button", { name: /See Results/i }));

    await user.click(await screen.findByRole("button", { name: /Try Again/i }));

    expect(screen.getByText("Question 1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: optionNamed("4") })).not.toBeDisabled();
  });

  it("regression: an out-of-range correctIndex is rejected instead of silently making every answer wrong — this is exactly the original production bug", () => {
    const originalEnv = process.env.NODE_ENV;
    // @ts-expect-error test-only override of a normally-readonly env var
    process.env.NODE_ENV = "development";

    const broken: QuizQuestionData[] = [
      {
        question: "Broken question",
        correctIndex: 5, // out of range — only 2 options exist below
        correctExplanation: "n/a",
        incorrectExplanation: "n/a",
        options: [{ text: "A" }, { text: "B" }],
      },
    ];
    render(<QuizSeries questions={broken} />);

    expect(screen.getByText(/Quiz configuration issue/i)).toBeInTheDocument();
    expect(screen.getByText(/isn't a valid option index/i)).toBeInTheDocument();

    // @ts-expect-error test-only override
    process.env.NODE_ENV = originalEnv;
  });
});
