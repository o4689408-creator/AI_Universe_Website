import { ObjectId, type Collection } from "mongodb";
import { getDb, isMongoConfigured, withDbRetry } from "@/lib/mongodb";
import type { MediaDoc } from "@/types/admin";

async function getMediaCollection(): Promise<Collection<MediaDoc>> {
  const db = await getDb();
  return db.collection<MediaDoc>("media");
}

function toObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/** Same reasoning as lib/admin/tags.ts#escapeRegExp — a plain substring search shouldn't throw on regex-special characters typed into the search box. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface MediaListItem {
  id: string;
  url: string;
  altText: string;
  caption?: string;
  createdAt: string;
}

export async function listMedia(query?: string): Promise<MediaListItem[]> {
  if (!isMongoConfigured()) return [];
  try {
    const docs = await withDbRetry(async () => {
      const collection = await getMediaCollection();
      const filter = query?.trim()
        ? {
            $or: [
              { altText: { $regex: escapeRegExp(query.trim()), $options: "i" } },
              { url: { $regex: escapeRegExp(query.trim()), $options: "i" } },
            ],
          }
        : {};
      return collection.find(filter).sort({ createdAt: -1 }).toArray();
    });
    return docs.map((doc) => ({
      id: doc._id.toString(),
      url: doc.url,
      altText: doc.altText,
      caption: doc.caption,
      createdAt: doc.createdAt,
    }));
  } catch (error) {
    console.error("[lib/admin/media] MongoDB unreachable while listing media:", error);
    if (process.env.NODE_ENV !== "production") {
      throw error instanceof Error ? error : new Error(String(error));
    }
    return [];
  }
}

export async function addMedia(input: { url: string; altText: string; caption?: string }): Promise<MediaDoc> {
  const url = input.url.trim();
  const altText = input.altText.trim();
  if (!url) throw new Error("Image URL is required.");
  if (!altText) throw new Error("Alt text is required — every image needs a description for accessibility and SEO.");

  try {
    new URL(url);
  } catch {
    throw new Error("Enter a valid image URL.");
  }

  const doc: MediaDoc = {
    _id: new ObjectId(),
    url,
    altText,
    caption: input.caption?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  await withDbRetry(async () => {
    const collection = await getMediaCollection();
    await collection.insertOne(doc);
  });
  return doc;
}

/**
 * Deletes a media entry — but only if no CMS article currently
 * references this exact URL as its hero, featured, OG, or Twitter
 * image, so "delete unused media" can never silently break a live
 * article's imagery.
 */
export async function deleteMedia(id: string): Promise<void> {
  const objectId = toObjectId(id);
  if (!objectId) throw new Error("Invalid media id.");

  await withDbRetry(async () => {
    const db = await getDb();
    const collection = await getMediaCollection();
    const existing = await collection.findOne({ _id: objectId });
    if (!existing) throw new Error("Media item not found.");

    const inUse = await db.collection("articles").countDocuments({
      $or: [
        { heroImageUrl: existing.url },
        { featuredImageUrl: existing.url },
        { ogImageUrl: existing.url },
        { twitterImageUrl: existing.url },
      ],
    });
    if (inUse > 0) {
      throw new Error(
        `This image is still used by ${inUse} article${inUse === 1 ? "" : "s"} — remove it from ${inUse === 1 ? "that article" : "those articles"} first.`
      );
    }

    await collection.deleteOne({ _id: objectId });
  });
}
