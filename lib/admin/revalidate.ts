import { revalidatePath } from "next/cache";

/**
 * Revalidates every public page that could show this article: the
 * homepage (latest/featured sections), the /topics hub, the article's
 * own page (old and new slug, in case it changed), /library
 * (bookmarks read topic data), and the RSS/sitemap feeds. Called after
 * every create/update/delete/publish/unpublish so changes appear on
 * the live site immediately rather than waiting for the next deploy —
 * the whole point of moving off manual MDX edits.
 */
export function revalidateArticlePaths(slugs: Array<string | undefined>): void {
  revalidatePath("/");
  revalidatePath("/topics");
  revalidatePath("/library");
  revalidatePath("/rss.xml");
  revalidatePath("/sitemap.xml");

  for (const slug of slugs) {
    if (slug) revalidatePath(`/topics/${slug}`);
  }
}
