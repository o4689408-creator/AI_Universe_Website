import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAuthor } from "@/lib/authors";
import { slugify } from "@/lib/slugify";
import { mdxComponents } from "@/components/article/mdx-components";
import type { SourceLink, TocHeading, Topic, TopicMeta } from "@/types/content";

const TOPICS_DIR = path.join(process.cwd(), "content", "topics");

interface TopicFrontmatter {
  title: string;
  subtitle: string;
  category: string;
  tags?: string[];
  authorId: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  heroImageUrl: string;
  companionVideoId?: string;
  trending?: boolean;
  sources?: SourceLink[];
  relatedSlugs?: string[];
}

function readTopicFile(slug: string): { raw: string; body: string } {
  const filePath = path.join(TOPICS_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf8");
  // Frontmatter is parsed by compileMDX itself; `raw` (full file) is also
  // kept so we can extract headings from the body via a cheap regex pass
  // without re-parsing the compiled MDX tree.
  const body = raw.replace(/^---[\s\S]*?---/, "");
  return { raw, body };
}

function extractHeadings(body: string): TocHeading[] {
  const headingPattern = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(body)) !== null) {
    const level = (match[1]?.length ?? 2) as 2 | 3;
    const text = match[2]?.trim() ?? "";
    if (!text) continue;
    headings.push({ id: slugify(text), text, level });
  }

  return headings;
}

export function listTopicSlugs(): string[] {
  if (!fs.existsSync(TOPICS_DIR)) return [];
  return fs
    .readdirSync(TOPICS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Lightweight metadata read — parses frontmatter only, no MDX
 * compilation. Used for listing pages (homepage, /topics hub,
 * Previous/Next lookups) so they stay fast even as the article count
 * grows.
 */
export async function readTopicMeta(slug: string): Promise<TopicMeta | null> {
  try {
    const { raw } = readTopicFile(slug);
    const { frontmatter } = await compileMDX<TopicFrontmatter>({
      source: raw,
      options: { parseFrontmatter: true },
    });

    return {
      slug,
      title: frontmatter.title,
      subtitle: frontmatter.subtitle,
      category: frontmatter.category,
      tags: frontmatter.tags ?? [],
      author: getAuthor(frontmatter.authorId),
      publishedAt: frontmatter.publishedAt,
      updatedAt: frontmatter.updatedAt,
      readTimeMinutes: frontmatter.readTimeMinutes,
      heroImageUrl: frontmatter.heroImageUrl,
      companionVideoId: frontmatter.companionVideoId,
      trending: frontmatter.trending ?? false,
      sources: frontmatter.sources ?? [],
      relatedSlugs: frontmatter.relatedSlugs ?? [],
    };
  } catch {
    return null;
  }
}

/**
 * Full compile — frontmatter + rendered body + extracted TOC. Used only
 * for the single article page being rendered.
 */
export async function readTopic(slug: string): Promise<Topic | null> {
  try {
    const { raw, body } = readTopicFile(slug);
    const { frontmatter, content } = await compileMDX<TopicFrontmatter>({
      source: raw,
      components: mdxComponents,
      options: {
        parseFrontmatter: true,
        mdxOptions: { remarkPlugins: [remarkGfm] },
      },
    });

    return {
      slug,
      title: frontmatter.title,
      subtitle: frontmatter.subtitle,
      category: frontmatter.category,
      tags: frontmatter.tags ?? [],
      author: getAuthor(frontmatter.authorId),
      publishedAt: frontmatter.publishedAt,
      updatedAt: frontmatter.updatedAt,
      readTimeMinutes: frontmatter.readTimeMinutes,
      heroImageUrl: frontmatter.heroImageUrl,
      companionVideoId: frontmatter.companionVideoId,
      trending: frontmatter.trending ?? false,
      sources: frontmatter.sources ?? [],
      relatedSlugs: frontmatter.relatedSlugs ?? [],
      content,
      headings: extractHeadings(body),
    };
  } catch {
    return null;
  }
}
