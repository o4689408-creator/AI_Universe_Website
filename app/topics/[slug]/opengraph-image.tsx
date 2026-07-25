import { ImageResponse } from "next/og";
import { getAllTopics } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((topic) => ({ slug: topic.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const topics = await getAllTopics();
  const topic = topics.find((item) => item.slug === params.slug);

  const title = topic?.title ?? "AI Universe";
  const category = topic?.category ?? "AI Universe";

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
          AI Universe
        </div>
      </div>
    ),
    { ...size }
  );
}
