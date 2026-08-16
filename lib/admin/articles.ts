import { ObjectId, type Collection } from "mongodb";
import { getDb, isMongoConfigured } from "@/lib/mongodb";
import { listTopicSlugs } from "@/lib/mdx";
import { slugify } from "@/lib/slugify";
import { getAuthor } from "@/lib/authors";
import { renderArticleMarkdown } from "@/lib/admin/render-markdown";
import { validateArticleInput, estimateReadTimeMinutes, parseYouTubeVideoId } from "@/lib/admin/validation";
import type { ArticleDoc, ArticleInput, ArticleListFilters, ArticleListResult, ArticleStatus } from "@/types/admin";
import type { Topic, TopicMeta, Video } from "@/types/content";

/**
 * MongoDB-backed article service — the CMS's single source of truth
 * for everything created/edited through the Admin dashboard. The four
 * launch articles in /content/topics stay plain .mdx files (lib/mdx.ts)
 * forever unless someone chooses to migrate them by hand; nothing here
 * reads or writes .mdx files. lib/content.ts merges both sources for
 * every public-facing page.
 */

let indexesEnsured = false;

async function getArticlesCollection(): Promise<Collection<ArticleDoc>> {
  const db = await getDb();
  const collection = db.collection<ArticleDoc>("articles");

  if (!indexesEnsured) {
    await Promise.all([
      collection.createIndex({ slug: 1 }, { unique: true }),
      collection.createIndex({ status: 1, publishedAt: -1 }),
      collection.createIndex({ featured: 1 }),
      collection.createIndex({ trending: 1 }),
      collection.createIndex({ category: 1 }),
      collection.createIndex({ tags: 1 }),
      collection.createIndex(
        { title: "text", subtitle: "text", slug: "text", category: "text", summary: "text" },
        { name: "article_search" }
      ),
    ]);
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

/** Builds a unique slug from a title, avoiding collisions with both existing MongoDB articles and the hand-authored .mdx slugs — checked once, together, so the two content sources can never collide. */
async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "article";
  const collection = await getArticlesCollection();

  const existingMongoSlugs = new Set(
    (await collection.find({}, { projection: { slug: 1 } }).toArray())
      .filter((doc) => !excludeId || doc._id.toString() !== excludeId)
      .map((doc) => doc.slug)
  );
  const mdxSlugs = new Set(listTopicSlugs());

  if (!existingMongoSlugs.has(base) && !mdxSlugs.has(base)) return base;

  let attempt = 2;
  while (existingMongoSlugs.has(`${base}-${attempt}`) || mdxSlugs.has(`${base}-${attempt}`)) {
    attempt += 1;
  }
  return `${base}-${attempt}`;
}

/** Whether a slug is free (used for the Admin form's live slug-availability check). */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getArticlesCollection();
  const mdxSlugs = new Set(listTopicSlugs());
  if (mdxSlugs.has(slug)) return false;

  const existing = await collection.findOne({ slug });
  if (!existing) return true;
  return Boolean(excludeId) && existing._id.toString() === excludeId;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
}

/**
 * Routes an optional string field into either `setFields` (when a
 * trimmed value is present) or `unsetFields` (when cleared) — see the
 * long comment on updateArticle for why this two-bucket split exists
 * instead of a single `$set` with `undefined` values.
 */
function applyOptionalField(
  setFields: Record<string, unknown>,
  unsetFields: Record<string, "">,
  key: string,
  value: string | undefined
): void {
  const trimmed = value?.trim();
  if (trimmed) setFields[key] = trimmed;
  else unsetFields[key] = "";
}

const OPTIONAL_STRING_FIELDS = [
  "featuredImageUrl",
  "youtubeUrl",
  "seoTitle",
  "metaDescription",
  "canonicalUrl",
  "ogTitle",
  "ogDescription",
  "ogImageUrl",
  "twitterImageUrl",
  "scheduledFor",
] as const;

/**
 * Whether an article should actually be visible on the public site
 * right now. "published" always is; "scheduled" becomes so the moment
 * `scheduledFor` passes. This is a lazy, read-time check rather than a
 * background job — there's no queue/cron runner in this architecture,
 * so a scheduled article goes live the next time its page (or a page
 * listing it) is actually requested/revalidated after the scheduled
 * moment, not necessarily at the exact second. Combined with the
 * existing hourly ISR safety net (see app/topics/[slug]/page.tsx) that
 * means at most an hour of lag in the worst case — for tighter
 * real-time guarantees, point a Vercel Cron Job at a small endpoint
 * that calls publishDueScheduledArticles() on a schedule (not wired up
 * by default, since it needs a Vercel project + cron config that
 * doesn't exist in this codebase).
 */
function isEffectivelyPublishedFilter(nowIso: string) {
  return {
    $or: [{ status: "published" as const }, { status: "scheduled" as const, scheduledFor: { $lte: nowIso } }],
  };
}

export async function createArticle(rawInput: ArticleInput, status: ArticleStatus): Promise<ArticleDoc> {
  const input = validateArticleInput(rawInput);
  const collection = await getArticlesCollection();

  const slug = input.slug?.trim()
    ? input.slug.trim()
    : await generateUniqueSlug(input.title);

  if (input.slug?.trim() && !(await isSlugAvailable(slug))) {
    throw new Error(`The slug "${slug}" is already in use.`);
  }

  const now = new Date().toISOString();
  const featuredImageUrl = input.featuredImageUrl?.trim() || undefined;
  // Drop any image row the admin added but never filled in — an empty
  // "slot" is a normal in-progress editing state, not something that
  // should reach the public gallery.
  const images = (input.images ?? []).filter((image) => image.url?.trim());
  const quiz = input.quiz ?? [];
  const youtubeUrl = input.youtubeUrl?.trim() || undefined;
  const seoTitle = input.seoTitle?.trim() || undefined;
  const metaDescription = input.metaDescription?.trim() || undefined;
  const canonicalUrl = input.canonicalUrl?.trim() || undefined;
  const ogTitle = input.ogTitle?.trim() || undefined;
  const ogDescription = input.ogDescription?.trim() || undefined;
  const ogImageUrl = input.ogImageUrl?.trim() || undefined;
  const twitterImageUrl = input.twitterImageUrl?.trim() || undefined;
  const scheduledFor = status === "scheduled" ? input.scheduledFor?.trim() || undefined : undefined;

  const doc: ArticleDoc = {
    _id: new ObjectId(),
    title: input.title.trim(),
    slug,
    subtitle: input.subtitle.trim(),
    summary: input.summary.trim(),
    category: input.category.trim(),
    tags: (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
    content: input.content,
    heroImageUrl: input.heroImageUrl.trim(),
    featuredImageUrl,
    images,
    quiz,
    youtubeUrl,
    authorId: input.authorId?.trim() || "founder",
    readTimeMinutes: input.readTimeMinutes ?? estimateReadTimeMinutes(input.content),
    publishedAt: status === "published" ? now : now,
    updatedAt: now,
    createdAt: now,
    featured: input.featured ?? false,
    trending: input.trending ?? false,
    status,
    sources: input.sources ?? [],
    relatedSlugs: input.relatedSlugs ?? [],
    seoTitle,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImageUrl,
    twitterImageUrl,
    scheduledFor,
  };

  try {
    await collection.insertOne(doc);
  } catch (error) {
    // The uniqueness pre-check above (generateUniqueSlug/isSlugAvailable)
    // has an unavoidable TOCTOU race under real concurrent writes — the
    // unique index on `slug` is the actual source of truth, and this is
    // its failure mode surfacing as a clean error instead of a raw
    // MongoServerError leaking up to the Admin form.
    if (isDuplicateKeyError(error)) {
      throw new Error(`The slug "${slug}" was just taken by another article. Please choose a different slug.`);
    }
    throw error;
  }

  return doc;
}

export async function updateArticle(id: string, rawInput: ArticleInput): Promise<ArticleDoc> {
  const objectId = toObjectId(id);
  if (!objectId) throw new Error("Invalid article id.");

  const input = validateArticleInput(rawInput);
  const collection = await getArticlesCollection();

  const existing = await collection.findOne({ _id: objectId });
  if (!existing) throw new Error("Article not found.");

  const slug = input.slug?.trim() ? input.slug.trim() : existing.slug;
  if (slug !== existing.slug && !(await isSlugAvailable(slug, id))) {
    throw new Error(`The slug "${slug}" is already in use.`);
  }

  const now = new Date().toISOString();
  // featuredImageUrl/youtubeUrl are optional fields represented as
  // `undefined` when cleared — but MongoDB's Node driver silently
  // drops any key whose value is `undefined` from a $set document
  // before it's even sent to the server (that's BSON serialization
  // behavior, not a bug in the query itself). That means naively doing
  // `$set: { youtubeUrl: undefined }` does NOT clear a previously-set
  // value — it just never touches the field, so the old value stays
  // in the database forever. $unset is the only way to actually remove
  // a field, so the two optional fields are routed there instead of
  // through the main $set when the admin clears them.
  const setFields: Record<string, unknown> = {
    title: input.title.trim(),
    slug,
    subtitle: input.subtitle.trim(),
    summary: input.summary.trim(),
    category: input.category.trim(),
    tags: (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
    content: input.content,
    heroImageUrl: input.heroImageUrl.trim(),
    images: (input.images ?? existing.images ?? []).filter((image) => image.url?.trim()),
    quiz: input.quiz ?? existing.quiz ?? [],
    authorId: input.authorId?.trim() || existing.authorId,
    readTimeMinutes: input.readTimeMinutes ?? estimateReadTimeMinutes(input.content),
    updatedAt: now,
    featured: input.featured ?? existing.featured,
    trending: input.trending ?? existing.trending,
    sources: input.sources ?? existing.sources,
    relatedSlugs: input.relatedSlugs ?? existing.relatedSlugs,
  };
  const unsetFields: Record<string, "">  = {};

  for (const field of OPTIONAL_STRING_FIELDS) {
    applyOptionalField(setFields, unsetFields, field, input[field]);
  }

  await collection.updateOne(
    { _id: objectId },
    Object.keys(unsetFields).length > 0
      ? { $set: setFields, $unset: unsetFields }
      : { $set: setFields }
  ).catch((error) => {
    if (isDuplicateKeyError(error)) {
      throw new Error(`The slug "${slug}" was just taken by another article. Please choose a different slug.`);
    }
    throw error;
  });

  const updated: ArticleDoc = { ...existing, ...setFields } as ArticleDoc;
  const updatedRecord = updated as unknown as Record<string, unknown>;
  for (const field of OPTIONAL_STRING_FIELDS) {
    delete updatedRecord[field];
    if (setFields[field] !== undefined) updatedRecord[field] = setFields[field];
  }

  return updated;
}

/**
 * Autosave — intentionally more lenient than createArticle/updateArticle:
 * a draft mid-composition can have an empty subtitle/category/hero
 * image while the admin is still writing, and autosave firing every
 * few seconds shouldn't throw a validation error every time. The only
 * hard requirement is a non-empty title (used to generate a slug for
 * a brand-new, not-yet-saved draft) — everything else defaults to an
 * empty string and gets properly validated later, when the admin
 * actually clicks "Save Draft" or "Publish" (which still go through
 * the strict validateArticleInput path above). This is also what makes
 * Draft Recovery work: the draft living in MongoDB from the last
 * autosave is exactly what /admin/articles/[id]/edit loads on return.
 */
export async function autosaveArticle(
  id: string | undefined,
  partial: Partial<ArticleInput>
): Promise<{ id: string; savedAt: string } | null> {
  const title = partial.title?.trim();
  if (!title) return null;

  const collection = await getArticlesCollection();
  const now = new Date().toISOString();

  const fields: Record<string, unknown> = {
    title,
    subtitle: partial.subtitle?.trim() ?? "",
    summary: partial.summary?.trim() ?? "",
    category: partial.category?.trim() ?? "",
    tags: (partial.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
    content: partial.content ?? "",
    heroImageUrl: partial.heroImageUrl?.trim() ?? "",
    images: partial.images ?? [],
    quiz: partial.quiz ?? [],
    authorId: partial.authorId?.trim() || "founder",
    readTimeMinutes: estimateReadTimeMinutes(partial.content ?? ""),
    updatedAt: now,
    featured: partial.featured ?? false,
    trending: partial.trending ?? false,
  };
  const unsetFields: Record<string, ""> = {};
  for (const field of OPTIONAL_STRING_FIELDS) {
    applyOptionalField(fields, unsetFields, field, partial[field]);
  }

  if (id) {
    const objectId = toObjectId(id);
    if (!objectId) return null;
    await collection.updateOne(
      { _id: objectId },
      Object.keys(unsetFields).length > 0 ? { $set: fields, $unset: unsetFields } : { $set: fields }
    );
    return { id, savedAt: now };
  }

  const slug = await generateUniqueSlug(title);
  const doc: ArticleDoc = {
    _id: new ObjectId(),
    slug,
    createdAt: now,
    publishedAt: now,
    status: "draft",
    sources: [],
    relatedSlugs: [],
    ...(fields as Omit<ArticleDoc, "_id" | "slug" | "createdAt" | "publishedAt" | "status" | "sources" | "relatedSlugs">),
  };

  try {
    await collection.insertOne(doc);
  } catch (error) {
    if (isDuplicateKeyError(error)) return null; // exceedingly unlikely two autosaves race on the exact same generated slug
    throw error;
  }

  return { id: doc._id.toString(), savedAt: now };
}

export async function setArticleStatus(
  id: string,
  status: ArticleStatus,
  scheduledFor?: string
): Promise<ArticleDoc> {
  const objectId = toObjectId(id);
  if (!objectId) throw new Error("Invalid article id.");

  const collection = await getArticlesCollection();
  const existing = await collection.findOne({ _id: objectId });
  if (!existing) throw new Error("Article not found.");

  if (status === "scheduled" && !scheduledFor?.trim()) {
    throw new Error("Choose a date and time to schedule this article for.");
  }

  const now = new Date().toISOString();
  const update: Partial<ArticleDoc> = {
    status,
    updatedAt: now,
    // A draft's publishedAt is only meaningful once it's actually been
    // published — the first publish sets it; re-publishing after an
    // unpublish keeps the original date rather than bumping it, same
    // as most editorial CMSes (unpublish/republish isn't "republishing
    // as new").
    publishedAt: status === "published" && !existing.publishedAt ? now : existing.publishedAt,
  };

  if (status === "scheduled") {
    await collection.updateOne(
      { _id: objectId },
      { $set: { ...update, scheduledFor: scheduledFor!.trim() } }
    );
    return { ...existing, ...update, scheduledFor: scheduledFor!.trim() };
  }

  // Leaving "scheduled" for any other status should clear the
  // now-meaningless scheduledFor date rather than leave a stale one
  // sitting in the document (same $unset reasoning as every other
  // optional field — see the long comment on updateArticle).
  await collection.updateOne({ _id: objectId }, { $set: update, $unset: { scheduledFor: "" } });
  const cleared = { ...existing, ...update } as ArticleDoc;
  delete cleared.scheduledFor;
  return cleared;
}

/** Deletes an article and returns its slug (callers use this to revalidate the now-gone public page). */
export async function deleteArticle(id: string): Promise<{ slug: string } | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const collection = await getArticlesCollection();
  const existing = await collection.findOne({ _id: objectId });
  if (!existing) return null;

  await collection.deleteOne({ _id: objectId });
  return { slug: existing.slug };
}

export async function getArticleDocById(id: string): Promise<ArticleDoc | null> {
  if (!isMongoConfigured()) return null;
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const collection = await getArticlesCollection();
  return collection.findOne({ _id: objectId });
}

/** All CMS articles matching the given filters, paginated — powers the Admin articles table's search/filter/pagination. */
export async function listArticlesForAdmin(filters: ArticleListFilters = {}): Promise<ArticleListResult> {
  if (!isMongoConfigured()) {
    return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));

  try {
    const collection = await getArticlesCollection();

    const conditions: Record<string, unknown>[] = [];
    if (filters.status) conditions.push({ status: filters.status });
    if (filters.category) conditions.push({ category: filters.category });
    if (filters.tag) conditions.push({ tags: filters.tag });
    if (filters.featured !== undefined) conditions.push({ featured: filters.featured });
    if (filters.trending !== undefined) conditions.push({ trending: filters.trending });
    if (filters.query?.trim()) conditions.push({ $text: { $search: filters.query.trim() } });

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const [docs, total] = await Promise.all([
      collection
        .find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      items: docs.map((doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        tags: doc.tags,
        status: doc.status,
        featured: doc.featured,
        trending: doc.trending,
        scheduledFor: doc.scheduledFor,
        publishedAt: doc.publishedAt,
        updatedAt: doc.updatedAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (error) {
    // Same reasoning as getPublishedArticlesAsTopicMetas above — a
    // genuinely unreachable MongoDB shouldn't hard-crash the Admin
    // articles list (and, same as lib/admin/categories.ts, this is
    // also what lets Next's build correctly recognize this route needs
    // dynamic rendering rather than failing outright while attempting
    // static optimization).
    console.error("[lib/admin/articles] MongoDB unreachable while listing articles:", error);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

/** Real dashboard counts — every number here comes directly from a MongoDB query, never fabricated. */
export async function getArticleStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  ready: number;
  scheduled: number;
  featured: number;
  trending: number;
}> {
  const empty = { total: 0, published: 0, draft: 0, ready: 0, scheduled: 0, featured: 0, trending: 0 };
  if (!isMongoConfigured()) return empty;

  try {
    const collection = await getArticlesCollection();
    const [total, published, draft, ready, scheduled, featured, trending] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ status: "published" }),
      collection.countDocuments({ status: "draft" }),
      collection.countDocuments({ status: "ready" }),
      collection.countDocuments({ status: "scheduled" }),
      collection.countDocuments({ featured: true }),
      collection.countDocuments({ trending: true }),
    ]);
    return { total, published, draft, ready, scheduled, featured, trending };
  } catch (error) {
    console.error("[lib/admin/articles] MongoDB unreachable while computing dashboard stats:", error);
    return empty;
  }
}

/**
 * Flips any "scheduled" article whose scheduledFor has passed over to
 * "published". Not wired to anything by default (see the doc comment
 * on isEffectivelyPublishedFilter) — call this from a Vercel Cron Job
 * endpoint if exact-time publishing (rather than lazy/read-time
 * visibility, which already works without this) matters for your use
 * case.
 */
export async function publishDueScheduledArticles(): Promise<number> {
  if (!isMongoConfigured()) return 0;
  const collection = await getArticlesCollection();
  const now = new Date().toISOString();
  const result = await collection.updateMany(
    { status: "scheduled", scheduledFor: { $lte: now } },
    { $set: { status: "published", updatedAt: now }, $unset: { scheduledFor: "" } }
  );
  return result.modifiedCount;
}

/** Builds the companion Video object directly from a pasted YouTube URL — see types/content.ts's `companionVideo` field doc comment for why this bypasses the static lib/videos.ts registry. */
function buildCompanionVideo(doc: ArticleDoc): Video | undefined {
  if (!doc.youtubeUrl) return undefined;
  const youtubeId = parseYouTubeVideoId(doc.youtubeUrl);
  if (!youtubeId) return undefined;

  return {
    id: `cms-${doc.slug}`,
    slug: doc.slug,
    title: doc.title,
    youtubeId,
    publishedAt: doc.publishedAt,
    thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    companionTopicSlug: doc.slug,
  };
}

export function articleDocToTopicMeta(doc: ArticleDoc): TopicMeta {
  return {
    slug: doc.slug,
    title: doc.title,
    subtitle: doc.subtitle,
    category: doc.category,
    tags: doc.tags,
    author: getAuthor(doc.authorId),
    publishedAt: doc.publishedAt,
    updatedAt: doc.updatedAt,
    readTimeMinutes: doc.readTimeMinutes,
    heroImageUrl: doc.featuredImageUrl || doc.heroImageUrl,
    images: doc.images.length > 0 ? doc.images : undefined,
    quiz: doc.quiz.length > 0 ? doc.quiz : undefined,
    trending: doc.trending,
    featured: doc.featured,
    sources: doc.sources,
    relatedSlugs: doc.relatedSlugs,
    contentText: doc.content.slice(0, 4000),
    companionVideo: buildCompanionVideo(doc),
    source: "cms",
    seoTitle: doc.seoTitle,
    metaDescription: doc.metaDescription,
    canonicalUrl: doc.canonicalUrl,
    ogTitle: doc.ogTitle,
    ogDescription: doc.ogDescription,
    ogImageUrl: doc.ogImageUrl,
    twitterImageUrl: doc.twitterImageUrl,
  };
}

export async function articleDocToTopic(doc: ArticleDoc): Promise<Topic> {
  const { content, headings } = await renderArticleMarkdown(doc.content);
  return { ...articleDocToTopicMeta(doc), heroImageUrl: doc.heroImageUrl, content, headings };
}

/** Published (or due-scheduled) CMS articles as TopicMeta, for merging into lib/content.ts#getAllTopics(). */
/**
 * Published (or due-scheduled) CMS articles as TopicMeta, for merging
 * into lib/content.ts#getAllTopics().
 *
 * Resilient by design, not just when unconfigured: if MongoDB is
 * genuinely unreachable (a real outage, a build-time network/TLS
 * failure — see the long comment on app/topics/[slug]/page.tsx's
 * generateStaticParams for the concrete incident this defends
 * against), this logs the failure clearly and returns an empty array
 * instead of throwing. Every caller (the homepage, /topics, RSS,
 * sitemap) already merges this with the real MDX articles from
 * lib/mdx.ts, so a Mongo outage degrades those pages to "today's CMS
 * articles are temporarily unavailable, the site's core content still
 * works" rather than a hard 500/build failure — the same trade-off
 * already made for `!isMongoConfigured()`, just widened to cover
 * "configured but not reachable right now" too. This is not returning
 * fake data: it's a real, empty result for a genuinely inaccessible
 * data source, and it self-heals on the next successful read (ISR
 * revalidation, or simply the next request once Mongo is back).
 */
export async function getPublishedArticlesAsTopicMetas(): Promise<TopicMeta[]> {
  if (!isMongoConfigured()) return [];
  try {
    const collection = await getArticlesCollection();
    const docs = await collection.find(isEffectivelyPublishedFilter(new Date().toISOString())).toArray();
    return docs.map(articleDocToTopicMeta);
  } catch (error) {
    console.error("[lib/admin/articles] MongoDB unreachable while listing published articles — degrading to MDX-only content for this read:", error);
    return [];
  }
}

/**
 * A single published (or due-scheduled) CMS article by slug, fully
 * rendered — null if it doesn't exist, isn't public yet, OR MongoDB is
 * genuinely unreachable right now (same resilience reasoning as
 * getPublishedArticlesAsTopicMetas above). Callers already treat null
 * as "show a 404" (see getTopicBySlug in lib/content.ts) — during a
 * real Mongo outage that means a CMS article is temporarily
 * unreachable rather than the whole site going down, which is the
 * correct trade-off for a database-backed page: it cannot render
 * without the database, full stop, but nothing else on the site
 * should go down because of it.
 */
export async function getPublishedArticleBySlugAsTopic(slug: string): Promise<Topic | null> {
  if (!isMongoConfigured()) return null;
  try {
    const collection = await getArticlesCollection();
    const doc = await collection.findOne({ slug, ...isEffectivelyPublishedFilter(new Date().toISOString()) });
    if (!doc) return null;
    return articleDocToTopic(doc);
  } catch (error) {
    console.error(`[lib/admin/articles] MongoDB unreachable while loading article "${slug}":`, error);
    return null;
  }
}
