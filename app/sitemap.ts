import type { MetadataRoute } from "next";
import { getAllTopics } from "@/lib/content";
import { SITE_URL } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const topics = await getAllTopics();

  const topicEntries: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${SITE_URL}/topics/${topic.slug}`,
    lastModified: topic.updatedAt,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/topics`, lastModified: new Date() },
    { url: `${SITE_URL}/videos`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
    { url: `${SITE_URL}/contact`, lastModified: new Date() },
    { url: `${SITE_URL}/legal/privacy`, lastModified: new Date() },
    { url: `${SITE_URL}/legal/terms`, lastModified: new Date() },
  ];

  return [...staticEntries, ...topicEntries];
}
