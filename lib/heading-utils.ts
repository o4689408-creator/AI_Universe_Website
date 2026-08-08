import { slugify } from "@/lib/slugify";
import type { TocHeading } from "@/types/content";

/**
 * Extracts H2/H3 headings from raw markdown/MDX body text for the
 * article's table of contents. Shared by lib/mdx.ts (file-based
 * articles) and lib/admin/render-markdown.ts (CMS/MongoDB-authored
 * articles) so the two content sources never drift into two different
 * TOC behaviors.
 */
export function extractHeadings(body: string): TocHeading[] {
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
