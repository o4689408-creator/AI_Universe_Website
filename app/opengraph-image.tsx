import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          AI Universe
        </div>
        <div style={{ fontSize: 28, color: "#A8A8AE", marginTop: 20 }}>
          Understand artificial intelligence, deeply.
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
    { ...size }
  );
}
