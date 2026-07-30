import { getAllTopics } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const topics = await getAllTopics();

  const items = topics
    .map((topic) => {
      const url = `${SITE_URL}/topics/${topic.slug}`;
      return `
    <item>
      <title>${escapeXml(topic.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(topic.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(topic.subtitle)}</description>
      <category>${escapeXml(topic.category)}</category>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
