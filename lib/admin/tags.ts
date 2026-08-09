import { ObjectId, type Collection } from "mongodb";
import { getDb, isMongoConfigured } from "@/lib/mongodb";
import { slugify } from "@/lib/slugify";
import { getAllTopics } from "@/lib/content";
import type { TagDoc } from "@/types/admin";

let indexesEnsured = false;

async function getTagsCollection(): Promise<Collection<TagDoc>> {
  const db = await getDb();
  const collection = db.collection<TagDoc>("tags");
  if (!indexesEnsured) {
    await collection.createIndex({ name: 1 }, { unique: true });
    indexesEnsured = true;
  }
  return collection;
}

function toObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
}

export interface TagWithUsage {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
}

export async function listTags(query?: string): Promise<TagWithUsage[]> {
  if (!isMongoConfigured()) return [];
  try {
    const collection = await getTagsCollection();
    const filter = query?.trim() ? { name: { $regex: query.trim(), $options: "i" } } : {};

    const [tags, topics] = await Promise.all([collection.find(filter).sort({ name: 1 }).toArray(), getAllTopics()]);

    return tags.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      slug: tag.slug,
      usageCount: topics.filter((t) => t.tags.includes(tag.name)).length,
    }));
  } catch (error) {
    // Same reasoning as lib/admin/categories.ts#listCategories.
    console.error("[lib/admin/tags] MongoDB unreachable while listing tags:", error);
    return [];
  }
}

export async function createTag(name: string): Promise<TagDoc> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name can't be empty.");
  const collection = await getTagsCollection();

  const doc: TagDoc = { _id: new ObjectId(), name: trimmed, slug: slugify(trimmed), createdAt: new Date().toISOString() };
  try {
    await collection.insertOne(doc);
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new Error(`"${trimmed}" already exists as a tag.`);
    throw error;
  }
  return doc;
}

/**
 * Renames a tag and swaps it in place inside every CMS article's tags
 * array. Mongo has no single-operation "rename this array element"
 * update, so this tracks which articles have the old tag *before*
 * pulling it, then pushes the new name onto exactly those same
 * articles — a $pull followed by a blind $addToSet on the new name
 * across the whole collection would incorrectly tag articles that
 * never had the old tag at all.
 */
export async function renameTag(id: string, newName: string): Promise<void> {
  const objectId = toObjectId(id);
  if (!objectId) throw new Error("Invalid tag id.");
  const trimmed = newName.trim();
  if (!trimmed) throw new Error("Tag name can't be empty.");

  const db = await getDb();
  const tags = await getTagsCollection();
  const existing = await tags.findOne({ _id: objectId });
  if (!existing) throw new Error("Tag not found.");

  try {
    await tags.updateOne({ _id: objectId }, { $set: { name: trimmed, slug: slugify(trimmed) } });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new Error(`"${trimmed}" already exists as a tag.`);
    throw error;
  }

  const articles = db.collection("articles");
  const affectedIds = (await articles.find({ tags: existing.name }).project({ _id: 1 }).toArray()).map((d) => d._id);
  if (affectedIds.length === 0) return;

  await articles.updateMany({ _id: { $in: affectedIds } }, { $pull: { tags: existing.name } } as never);
  await articles.updateMany({ _id: { $in: affectedIds } }, { $addToSet: { tags: trimmed } } as never);
}

/**
 * Deletes a tag. Unlike categories, this is non-blocking: tags are
 * low-stakes, freely-editable metadata, not structural taxonomy, so
 * deletion cascades — the tag is pulled from every article's tags
 * array (CMS articles only; .mdx frontmatter can't be edited here) and
 * then the tag document itself is removed.
 */
export async function deleteTag(id: string): Promise<void> {
  const objectId = toObjectId(id);
  if (!objectId) throw new Error("Invalid tag id.");

  const db = await getDb();
  const tags = await getTagsCollection();
  const existing = await tags.findOne({ _id: objectId });
  if (!existing) throw new Error("Tag not found.");

  await db.collection("articles").updateMany({ tags: existing.name }, { $pull: { tags: existing.name } } as never);
  await tags.deleteOne({ _id: objectId });
}
