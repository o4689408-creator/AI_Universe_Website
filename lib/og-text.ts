/**
 * Article titles routinely contain typographic punctuation — this
 * project's own GPT-5.6 article title has a real em dash ("—",
 * U+2014) in it. Even with an explicit font supplied (see
 * lib/og-font.ts), if that font's glyph table doesn't cover a given
 * character, Satori still has to resolve a fallback glyph, and that
 * resolution is a second, independent way to hit the same class of
 * WASM/URL loading issue that broke the build. Since this CMS lets an
 * admin type any title at all (Phase 3), this isn't a one-off fix for
 * today's four articles — it has to hold for whatever anyone types
 * next.
 *
 * Normalizing to plain ASCII for the OG image specifically (never for
 * the actual article text, which keeps its real typography) is a
 * complete, permanent fix for that entire class of trigger, not a
 * patch for one title.
 */
export function sanitizeOgText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u2010-\u2015]/g, "-") // hyphens, en/em dashes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // curly double quotes
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/[\u0300-\u036f]/g, "") // combining accent marks left over from NFKD (café -> cafe)
    .replace(/[^\x00-\x7F]/g, ""); // anything else non-ASCII (emoji, non-Latin scripts) — dropped, never rendered
}
