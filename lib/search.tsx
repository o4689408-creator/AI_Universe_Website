import type { ReactNode } from "react";
import type { TopicMeta } from "@/types/content";

/**
 * Search engine for articles.
 *
 * This is the one place "what counts as a match, and how good a match
 * is it" gets decided — both SearchBox and CommandPalette call this
 * rather than each re-implementing their own filtering, so improving
 * search means editing one file, not two.
 *
 * Fields searched: title, subtitle (summary), category, tags (also
 * covers "keywords" — the content model has one field for this), and
 * author name. Every field read here comes from TopicMeta, which is
 * derived automatically from each article's frontmatter — so a new
 * article becomes searchable the moment its .mdx file exists, with no
 * code change and no separate index to maintain.
 */

export interface SearchResult {
  topic: TopicMeta;
  score: number;
}

const WEIGHTS = {
  titleStartsWith: 100,
  titleContains: 60,
  tagExact: 35,
  subtitleContains: 25,
  tagContains: 20,
  categoryContains: 15,
  authorContains: 10,
};

function scoreTopic(topic: TopicMeta, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = topic.title.toLowerCase();
  const subtitle = topic.subtitle.toLowerCase();
  const category = topic.category.toLowerCase();
  const author = topic.author.name.toLowerCase();
  const tags = topic.tags.map((tag) => tag.toLowerCase());

  let score = 0;

  if (title.includes(q)) {
    score += title.startsWith(q) ? WEIGHTS.titleStartsWith : WEIGHTS.titleContains;
  }
  if (tags.some((tag) => tag === q)) score += WEIGHTS.tagExact;
  if (subtitle.includes(q)) score += WEIGHTS.subtitleContains;
  if (tags.some((tag) => tag.includes(q))) score += WEIGHTS.tagContains;
  if (category.includes(q)) score += WEIGHTS.categoryContains;
  if (author.includes(q)) score += WEIGHTS.authorContains;

  return score;
}

/**
 * Returns topics matching the query, ranked best-match-first.
 * Case-insensitive, partial-word ("transform" matches "Transformers").
 * Empty/whitespace query returns no results (the caller decides what
 * to show before the user has typed anything).
 */
export function searchTopics(topics: TopicMeta[], query: string): SearchResult[] {
  if (!query.trim()) return [];

  return topics
    .map((topic) => ({ topic, score: scoreTopic(topic, query) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Wraps the first occurrence of `query` inside `text` in a <mark>,
 * case-insensitively. Returns the original text untouched if there's
 * no match in this particular field — safe to call on every displayed
 * field regardless of which field actually matched.
 */
export function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;

  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-accent-muted text-accent">
        {text.slice(index, index + q.length)}
      </mark>
      {text.slice(index + q.length)}
    </>
  );
}
