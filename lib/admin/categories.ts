import { ObjectId, type Collection } from "mongodb";
import { getDb, isMongoConfigured, withDbRetry } from "@/lib/mongodb";
import { slugify } from "@/lib/slugify";
import { getAllTopics } from "@/lib/content";
import type { CategoryDoc } from "@/types/admin";

let indexesEnsured = false;

async function getCategoriesCollection(): Promise<Collection<CategoryDoc>> {
  const db = await getDb();
  const collection = db.collection<CategoryDoc>("categories");
  if (!indexesEnsured) {
    try {
      await collection.createIndex({ name: 1 }, { unique: true });
    } catch (error) {
      console.error("[lib/admin/categories] Could not ensure unique index on categories.name:", error);
    }
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

export interface CategoryWithUsage {
  id: string;
  name: string;
  slug: string;
  /** Articles (CMS-sourced) currently using this category name. */
  usageCount: number;
  /** Hand-authored .mdx articles using this category name — counted for a complete picture, but can never be reassigned here since those live in files, not the database. */
  mdxUsageCount: number;
}

export async function listCategories(): Promise<CategoryWithUsage[]> {
  if (!isMongoConfigured()) return [];
  try {
    const [categories, topics] = await withDbRetry(async () => {
      const collection = await getCategoriesCollection();
      return Promise.all([collection.find({}).sort({ name: 1 }).toArray(), getAllTopics()]);
    });

    return categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      usageCount: topics.filter((t) => t.category === cat.name && t.source === "cms").length,
      mdxUsageCount: topics.filter((t) => t.category === cat.name && t.source === "mdx").length,
    }));
  } catch (error) {
    // A genuinely unreachable MongoDB shouldn't hard-crash this page —
    // this specifically also prevents a build-time failure while
    // Next.js's static-optimization pass is still deciding whether
    // /admin/categories needs to be dynamic (it does, via
    // requireAdminSession()'s cookies() call — but only gets to make
    // that determination if nothing throws first).
    console.error("[lib/admin/categories] MongoDB unreachable while listing categories:", error);
    if (process.env.NODE_ENV !== "production") {
      // See lib/admin/tags.ts#listTags for why this distinction matters:
      // a real, configured-but-erroring database was previously
      // indistinguishable from "you just have no categories yet".
      throw error instanceof Error ? error : new Error(String(error));
    }
    return [];
  }
}

export async function createCategory(name: string): Promise<CategoryDoc> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const doc: CategoryDoc = { _id: new ObjectId(), name: trimmed, slug: slugify(trimmed), createdAt: new Date().toISOString() };
  try {
    await withDbRetry(async () => {
      const collection = await getCategoriesCollection();
      await collection.insertOne(doc);
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new Error(`"${trimmed}" already exists as a category.`);
    throw error;
  }
  return doc;
}

/** Renames a category and cascades the new name onto every CMS article currently using the old one, so nothing silently falls out of its category. */
export async function renameCategory(id: string, newName: string): Promise<void> {
  const objectId = toObjectId(id);
  if (!objectId) throw new Error("Invalid category id.");
  const trimmed = newName.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const oldName = await withDbRetry(async () => {
    const categories = await getCategoriesCollection();
    const existing = await categories.findOne({ _id: objectId });
    if (!existing) throw new Error("Category not found.");
    return existing.name;
  });

  await withDbRetry(async () => {
    const categories = await getCategoriesCollection();
    try {
      await categories.updateOne({ _id: objectId }, { $set: { name: trimmed, slug: slugify(trimmed) } });
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new Error(`"${trimmed}" already exists as a category.`);
      throw error;
    }
  });

  await withDbRetry(async () => {
    const db = await getDb();
    await db.collection("articles").updateMany({ category: oldName }, { $set: { category: trimmed } });
  });
}

/**
 * Deletes a category. Refuses if any CMS article still uses it unless
 * `reassignTo` is given, in which case every affected article is
 * bulk-updated to the new category first — deletion never silently
 * orphans articles. MDX-authored articles' `category` frontmatter
 * can't be touched here (they're files, not database rows); if any
 * still reference this category, deletion is blocked entirely with a
 * clear explanation rather than leaving the public site showing a
 * now-unmanaged category name.
 */
export async function deleteCategory(id: string, reassignTo?: string): Promise<void> {
  const objectId = toObjectId(id);
  if (!objectId) throw new Error("Invalid category id.");

  const categoryName = await withDbRetry(async () => {
    const categories = await getCategoriesCollection();
    const existing = await categories.findOne({ _id: objectId });
    if (!existing) throw new Error("Category not found.");
    return existing.name;
  });

  const topics = await getAllTopics();
  const mdxUsage = topics.filter((t) => t.category === categoryName && t.source === "mdx").length;
  if (mdxUsage > 0) {
    throw new Error(
      `"${categoryName}" is still used by ${mdxUsage} hand-authored (.mdx) article${mdxUsage === 1 ? "" : "s"}, which can't be reassigned from here. Update those files' frontmatter first.`
    );
  }

  const cmsUsage = topics.filter((t) => t.category === categoryName && t.source === "cms").length;
  if (cmsUsage > 0) {
    if (!reassignTo?.trim()) {
      throw new Error(
        `"${categoryName}" is used by ${cmsUsage} article${cmsUsage === 1 ? "" : "s"}. Choose a category to reassign them to before deleting.`
      );
    }
    await withDbRetry(async () => {
      const db = await getDb();
      await db.collection("articles").updateMany({ category: categoryName }, { $set: { category: reassignTo.trim() } });
    });
  }

  await withDbRetry(async () => {
    const categories = await getCategoriesCollection();
    await categories.deleteOne({ _id: objectId });
  });
}
