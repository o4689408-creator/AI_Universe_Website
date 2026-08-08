/**
 * Flesch Reading Ease — a real, standard readability formula (Rudolf
 * Flesch, 1948), not an invented metric. Score ranges roughly 0-100;
 * higher is easier to read. Used by the Admin editor's live stats bar
 * so "Reading Difficulty" reflects the actual text being written, not
 * a placeholder value.
 */

function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return 0;
  if (normalized.length <= 3) return 1;

  // Strip common silent-e endings before counting vowel groups.
  const withoutSilentE = normalized.replace(/(?:[^laeiouy]e)$/, (match) => match[0] ?? "");
  const vowelGroups = withoutSilentE.match(/[aeiouy]+/g);
  return Math.max(1, vowelGroups?.length ?? 1);
}

export interface ReadabilityStats {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  syllableCount: number;
  /** Flesch Reading Ease, 0-100+ (can exceed the nominal range for very short/simple text). */
  fleschScore: number;
  label: "Very Easy" | "Easy" | "Fairly Easy" | "Standard" | "Fairly Difficult" | "Difficult" | "Very Difficult";
}

function fleschLabel(score: number): ReadabilityStats["label"] {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Difficult";
}

/** Strips Markdown syntax (headings, emphasis, links, code fences, etc.) before counting, so formatting characters don't skew word/sentence counts. */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#-]/g, " ")
    .trim();
}

export function computeReadabilityStats(markdown: string): ReadabilityStats {
  const plainText = stripMarkdown(markdown);
  const words = plainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const sentences = plainText.split(/[.!?]+(?:\s|$)/).map((s) => s.trim()).filter(Boolean);
  const sentenceCount = Math.max(1, sentences.length);

  const paragraphCount = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;

  const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);

  if (wordCount === 0) {
    return { wordCount: 0, sentenceCount: 0, paragraphCount: 0, syllableCount: 0, fleschScore: 0, label: "Standard" };
  }

  const fleschScore =
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    syllableCount,
    fleschScore: Math.round(fleschScore * 10) / 10,
    label: fleschLabel(fleschScore),
  };
}
