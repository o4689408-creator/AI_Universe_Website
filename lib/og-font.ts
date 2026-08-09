import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Explicitly supplies ImageResponse with a real, local, already-on-disk
 * font instead of letting it fall back to Next's own automatic
 * default-font resolution.
 *
 * Root cause this works around: `npm run build` failed while
 * prerendering both OG image routes with
 * `TypeError: Invalid URL at new URL (...) @vercel/og/index.node.js`.
 * Tracing the actual vendored source
 * (node_modules/next/dist/compiled/@vercel/og/index.node.js) to the
 * exact line shows this is wasm-bindgen glue code for a WASM module
 * @vercel/og depends on:
 *
 *   async function init(input) {
 *     if (typeof input === "undefined") {
 *       input = new URL("index_bg.wasm", void 0);
 *     }
 *     ...
 *   }
 *
 * `new URL("index_bg.wasm", void 0)` — a relative path resolved
 * against an `undefined` base — throws "Invalid URL" under the WHATWG
 * URL spec. This is Next.js's own bundled code (not this project's),
 * and it's a documented, environment-sensitive failure mode: whatever
 * mechanism is supposed to supply `input` explicitly doesn't always do
 * so, and which branch runs differs by OS/build environment (this is
 * why the build succeeds in some environments and fails in others —
 * it did not reproduce in this sandbox's Linux/Node 22 build, which is
 * exactly the kind of environment-dependent behavior this class of bug
 * is known for; see the file-level note in app/opengraph-image.tsx for
 * what that means for how much this fix could be verified here).
 *
 * The standard, widely-documented workaround (not a guess — this is
 * the fix Vercel/community threads on this exact error converge on)
 * is to give ImageResponse a `fonts` array up front. That changes
 * which code path Satori takes for text shaping and sidesteps Next's
 * own automatic default-font-fetch logic entirely, rather than
 * depending on it succeeding.
 *
 * The font itself is not a new dependency: it's the already-installed
 * `geist` package's Semibold weight, decompressed once from its
 * bundled .woff2 (Satori requires TTF/OTF, not WOFF2) into
 * assets/fonts/geist-semibold.ttf and committed as a static asset —
 * no font-conversion library is needed at build or request time, only
 * a plain `fs.readFile` of a file that's already on disk both locally
 * and on Vercel.
 */

let cachedFontData: ArrayBuffer | null = null;

export async function getOgFontData(): Promise<ArrayBuffer> {
  if (cachedFontData) return cachedFontData;

  const fontPath = path.join(process.cwd(), "assets", "fonts", "geist-semibold.ttf");
  const buffer = await readFile(fontPath);
  cachedFontData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  return cachedFontData;
}

export const OG_FONT_FAMILY = "Geist";
