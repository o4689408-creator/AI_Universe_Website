import type { ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { extractHeadings } from "@/lib/heading-utils";
import type { TocHeading } from "@/types/content";

/**
 * Renders a CMS article's body (plain text/Markdown, pasted or typed
 * by the admin — not hand-authored MDX) into a ReactNode.
 *
 * Deliberately compiled with `mdxOptions.format: "md"`, NOT the default
 * "mdx" format used by lib/mdx.ts for the hand-authored .mdx files in
 * /content/topics. Plain MDX parses `<`, `>`, and `{`/`}` as the start
 * of JSX — completely reasonable for hand-authored files with actual
 * custom components in them, but a real correctness problem for
 * arbitrary pasted prose ("temperature > 100°C", "List<string>",
 * "productivity < 50%" are all completely ordinary sentences a real
 * article might contain, and each one would throw an MDX compile
 * error). `format: "md"` parses standard CommonMark + GFM instead —
 * headings, bold/italic, lists, links, blockquotes, code fences,
 * tables, strikethrough — and treats those same characters as the
 * literal text they are, exactly like reading pasted text should
 * behave. This is the actual "paste your article, click publish"
 * requirement, not a placeholder: the same remark-gfm plugin and the
 * same compiler already used elsewhere in this project, just in its
 * plain-Markdown mode instead of MDX mode.
 *
 * On a genuine parse failure (malformed input Markdown can't recover
 * from) this throws — callers (lib/admin/articles.ts) let that surface
 * as a clear validation error back to the Admin form rather than
 * silently publishing broken content.
 */
export async function renderArticleMarkdown(
  body: string
): Promise<{ content: ReactNode; headings: TocHeading[] }> {
  const { content } = await compileMDX({
    source: body,
    options: {
      mdxOptions: { remarkPlugins: [remarkGfm], format: "md" },
    },
  });

  return { content, headings: extractHeadings(body) };
}
