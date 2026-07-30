# /content/topics

This is where the flagship article MDX files will live once the Topics
hub is built (next phase).

**Planned v1 format:** one `.mdx` file per topic, e.g.
`content/topics/what-is-a-transformer.mdx`, with frontmatter matching
the `Topic` type in `types/content.ts`.

**Migration path:** `lib/content.ts` is the only file that knows
content currently comes from this directory. When the site moves to a
headless CMS (blueprint Phase 2+), `lib/content.ts` is updated to fetch
from the CMS instead — no page or component changes.
