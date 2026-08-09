import { ImageResponse } from "next/og";
import { getOgFontData, OG_FONT_FAMILY } from "@/lib/og-font";
import { sanitizeOgText } from "@/lib/og-text";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// See lib/og-font.ts for why this route explicitly supplies a font
// instead of relying on ImageResponse's own default-font resolution —
// that's what was throwing "TypeError: Invalid URL" during
// prerendering.
export default async function OpengraphImage() {
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
            fontSize: 64,
            fontWeight: 700,
            color: "#F2F2F0",
            letterSpacing: "-0.02em",
          }}
        >
          {sanitizeOgText("AI Universe")}
        </div>
        <div style={{ fontSize: 28, color: "#A8A8AE", marginTop: 20 }}>
          {sanitizeOgText("Understand artificial intelligence, deeply.")}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 48,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: "#4C7DFF",
                opacity: 0.4 + i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: OG_FONT_FAMILY, data: fontData, weight: 700, style: "normal" }],
    }
  );
}
