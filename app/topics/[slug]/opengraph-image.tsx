import { ImageResponse } from "next/og";
import { listTopicSlugs, readTopicMeta } from "@/lib/mdx";
import { getTopicBySlug } from "@/lib/content";
import { getOgFontData, OG_FONT_FAMILY } from "@/lib/og-font";
import { sanitizeOgText } from "@/lib/og-text";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * MDX-only on purpose (listTopicSlugs(), not getAllTopics()) — this is
 * exactly what generateStaticParams needs to run at build time, and
 * getAllTopics() also queries MongoDB to include CMS-authored articles.
 * That's fine at runtime (a live server has real DB connectivity) but
 * is exactly what caused the earlier MongoDB TLS error when this ran
 * during the Vercel *build* step (which has no guaranteed DB network
 * access). Slugs for CMS-authored articles aren't in this list, so
 * they simply aren't statically generated here — dynamicParams
 * defaults to true, so their OG image still renders correctly on
 * first real request (see the component below), just not pre-built.
 */
export async function generateStaticParams() {
  return listTopicSlugs().map((slug) => ({ slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  // MDX first (zero DB calls, covers every statically-generated slug
  // above) — Mongo is only ever touched here for a CMS-authored slug
  // that generateStaticParams didn't cover, and only at real request
  // time, never during `next build`.
  const mdxMeta = await readTopicMeta(params.slug);
  const meta = mdxMeta ?? (await getTopicBySlug(params.slug));

  const title = sanitizeOgText(meta?.title ?? "AI Universe");
  const category = sanitizeOgText(meta?.category ?? "AI Universe");
  const fontData = await getOgFontData();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0A0A0C",
          backgroundImage:
            "radial-gradient(circle at 30% 30%, #18181c 0%, #0A0A0C 70%)",
          padding: "80px",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#4C7DFF",
          }}
        >
          {category}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#F2F2F0",
            letterSpacing: "-0.02em",
            marginTop: 20,
            maxWidth: 950,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#A8A8AE", marginTop: 32 }}>
          {sanitizeOgText("AI Universe")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: OG_FONT_FAMILY, data: fontData, weight: 700, style: "normal" }],
    }
  );
}
