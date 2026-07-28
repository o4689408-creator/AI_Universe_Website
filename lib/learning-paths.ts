import type { TopicMeta } from "@/types/content";

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  /** Topic slugs in the intended reading order. */
  topicSlugs: string[];
}

/**
 * Learning paths are a data model, not (yet) an authored-in-frontmatter
 * feature — adding a new path is adding an entry here. With only 3
 * articles today, one honest path is what the content actually
 * supports; the pattern (an ordered slug list resolved against
 * getAllTopics()) scales cleanly as more articles are published across
 * more paths.
 */
export const learningPaths: LearningPath[] = [
  {
    id: "ai-foundations-101",
    title: "AI Foundations 101",
    description: "Start with how models work, then see where it's all heading.",
    topicSlugs: [
      "how-transformers-actually-work",
      "inside-large-language-models",
      "the-real-path-to-agi",
    ],
  },
];

export interface ResolvedLearningPath {
  id: string;
  title: string;
  description: string;
  steps: TopicMeta[];
}

export function resolveLearningPath(
  path: LearningPath,
  topics: TopicMeta[]
): ResolvedLearningPath {
  const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  const steps = path.topicSlugs
    .map((slug) => bySlug.get(slug))
    .filter((topic): topic is TopicMeta => topic !== undefined);

  return { id: path.id, title: path.title, description: path.description, steps };
}
