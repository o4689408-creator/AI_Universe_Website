import type { Author } from "@/types/content";

export const authors: Record<string, Author> = {
  founder: {
    id: "founder",
    name: "AI Universe",
    title: "Editorial Team",
    bio: "Deep research and documentary-style explanations of artificial intelligence, built alongside the AI Universe YouTube channel.",
  },
};

export function getAuthor(id: string): Author {
  return authors[id] ?? authors.founder!;
}
