/**
 * Converts heading text to a URL-safe id. Used by both the MDX heading
 * components (to set the actual DOM id) and the TOC extractor (to build
 * matching hrefs) — kept in one place so the two never drift apart.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
