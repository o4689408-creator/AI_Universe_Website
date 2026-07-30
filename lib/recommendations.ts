import type { TopicMeta } from "@/types/content";

/**
 * "Explore Your AI Journey" recommendation engine.
 *
 * Deliberately simple and fully deterministic: it scores each topic
 * against the interests a visitor selected by matching against fields
 * that already exist on every article (category + tags) — no new
 * content, no ML model, no external service. This is the same
 * philosophy as lib/search.ts: one small, pure, reusable function that
 * every future recommendation surface (a "Recommended for you" section
 * elsewhere, a future onboarding flow, etc.) can call instead of
 * re-deriving relevance from scratch.
 *
 * Interests are matched loosely against category/tags (substring,
 * case-insensitive) via a keyword map, so this keeps working as new
 * interests or articles are added without code changes to the scoring
 * logic itself — only the keyword map below ever needs updating.
 */

export interface Archetype {
  title: string;
  description: string;
}

export interface Interest {
  id: string;
  label: string;
  /** Keywords matched against each topic's category + tags. */
  keywords: string[];
  /** Shown on the quiz "reveal" screen when this interest is the strongest match. */
  archetype: Archetype;
}

export const interests: Interest[] = [
  {
    id: "ai-models",
    label: "AI Models",
    keywords: ["llm", "model", "transformer", "inference", "training"],
    archetype: {
      title: "The Architect",
      description: "You want to understand how AI actually works under the hood — not just what it can do.",
    },
  },
  {
    id: "robotics",
    label: "Robotics",
    keywords: ["robot", "robotics", "embodied"],
    archetype: {
      title: "The Builder",
      description: "You're drawn to AI that moves through and acts on the physical world.",
    },
  },
  {
    id: "ai-tools",
    label: "AI Tools",
    keywords: ["tool", "product", "assistant"],
    archetype: {
      title: "The Operator",
      description: "You care most about what AI can actually do for you, today.",
    },
  },
  {
    id: "programming",
    label: "Programming",
    keywords: ["code", "programming", "developer", "engineering"],
    archetype: {
      title: "The Engineer",
      description: "You want to build with AI, not just read about it.",
    },
  },
  {
    id: "creativity",
    label: "Creativity",
    keywords: ["creativity", "art", "generative", "design"],
    archetype: {
      title: "The Creator",
      description: "You're exploring where AI and creative work meet.",
    },
  },
  {
    id: "business-ai",
    label: "Business AI",
    keywords: ["business", "enterprise", "strategy", "economy"],
    archetype: {
      title: "The Strategist",
      description: "You're thinking about what AI means for organizations and decisions.",
    },
  },
  {
    id: "research",
    label: "AI Research",
    keywords: ["research", "paper", "science", "safety"],
    archetype: {
      title: "The Scholar",
      description: "You want the real research, not the headlines.",
    },
  },
  {
    id: "future-tech",
    label: "Future Technology",
    keywords: ["agi", "future", "frontier", "trajectory"],
    archetype: {
      title: "The Futurist",
      description: "You're most curious about where all of this is actually heading.",
    },
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    keywords: ["chatgpt", "openai", "gpt"],
    archetype: {
      title: "The Practitioner",
      description: "You want to get the most out of the AI tools you already use every day.",
    },
  },
  {
    id: "claude",
    label: "Claude",
    keywords: ["claude", "anthropic"],
    archetype: {
      title: "The Collaborator",
      description: "You think of AI as a thinking partner, not just a tool.",
    },
  },
  {
    id: "gemini",
    label: "Gemini",
    keywords: ["gemini", "bard", "google ai"],
    archetype: {
      title: "The Explorer",
      description: "You like comparing how different AI labs approach the same problem.",
    },
  },
  {
    id: "startups",
    label: "Startups",
    keywords: ["startup", "founder", "venture"],
    archetype: {
      title: "The Founder",
      description: "You're thinking about AI in terms of what it makes newly possible to build.",
    },
  },
  {
    id: "education",
    label: "Education",
    keywords: ["education", "teaching", "curriculum", "learning"],
    archetype: {
      title: "The Educator",
      description: "You care about making AI genuinely understandable to others.",
    },
  },
];

export interface RecommendationResult {
  topic: TopicMeta;
  score: number;
  matchedInterests: string[];
}

function topicHaystack(topic: TopicMeta): string {
  return [topic.category, ...topic.tags].join(" ").toLowerCase();
}

/**
 * Scores and ranks topics against a set of selected interest ids.
 * A topic matching more selected interests, or matching more strongly
 * (category match weighs more than a single tag), ranks higher.
 */
export function recommendTopics(
  topics: TopicMeta[],
  selectedInterestIds: string[]
): RecommendationResult[] {
  if (selectedInterestIds.length === 0) return [];

  const selected = interests.filter((interest) => selectedInterestIds.includes(interest.id));

  const results = topics.map((topic) => {
    const haystack = topicHaystack(topic);
    const category = topic.category.toLowerCase();
    let score = 0;
    const matchedInterests: string[] = [];

    for (const interest of selected) {
      const matchesThisInterest = interest.keywords.some((keyword) => haystack.includes(keyword));
      if (!matchesThisInterest) continue;

      matchedInterests.push(interest.label);
      const categoryMatch = interest.keywords.some((keyword) => category.includes(keyword));
      score += categoryMatch ? 20 : 10;
    }

    return { topic, score, matchedInterests };
  });

  return results
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Determines which of the visitor's selected interests has the
 * strongest actual match in the content — that becomes their "AI
 * Profile" on the quiz reveal screen. Falls back to the first selected
 * interest if none of them match any content yet (still a meaningful
 * result, just not content-driven in that edge case).
 */
export function getTopArchetype(
  topics: TopicMeta[],
  selectedInterestIds: string[]
): Archetype | null {
  const selected = interests.filter((interest) => selectedInterestIds.includes(interest.id));
  if (selected.length === 0) return null;

  const totals = selected.map((interest) => {
    const total = topics.reduce((sum, topic) => {
      const haystack = topicHaystack(topic);
      const matches = interest.keywords.some((keyword) => haystack.includes(keyword));
      return matches ? sum + 1 : sum;
    }, 0);
    return { interest, total };
  });

  totals.sort((a, b) => b.total - a.total);

  return totals[0]!.interest.archetype;
}
