interface CiteProps {
  /**
   * A string, not a number — deliberately. MDX silently drops JS
   * expression props (e.g. index={1}) on inline custom components used
   * mid-paragraph (verified empirically; a real MDX/remark parsing
   * limitation, not a bug in this component). String literal props
   * (index="1") parse reliably, so that's the supported syntax.
   */
  index: string;
}

/**
 * Usage in MDX: <Cite index="1" /> renders as a superscript [1] linking
 * to the matching numbered entry in SourcesList (which renders id="source-1",
 * "source-2", etc. — the numbers must match the order of the `sources`
 * array in the article's frontmatter).
 */
export function Cite({ index }: CiteProps) {
  return (
    <sup>
      <a
        href={`#source-${index}`}
        className="text-accent no-underline hover:underline"
      >
        [{index}]
      </a>
    </sup>
  );
}
