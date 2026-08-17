"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin/auth";
import { createCategory, renameCategory, deleteCategory } from "@/lib/admin/categories";
import { createTag, renameTag, deleteTag } from "@/lib/admin/tags";
import { addMedia, deleteMedia } from "@/lib/admin/media";

/**
 * `redirect()` (via flashRedirect below) works by throwing internally —
 * that's how Next.js signals navigation intent from a Server Action.
 * Next.js's own docs are explicit that it must never be called from
 * inside a try block that has a catch capable of intercepting that
 * throw: https://nextjs.org/docs/app/api-reference/functions/redirect
 * ("redirect throws an error so it should be called outside the try
 * block"). This file previously violated that in every single action
 * below — flashRedirect(...) was the last statement inside `try`, so
 * its own throw was caught by the very next `catch` block, which then
 * called flashRedirect again with an *error* result. The practical,
 * observable effect: every successful create/rename/delete redirected
 * to the error flash state instead of the success one, even though the
 * underlying database operation had already completed correctly.
 *
 * Every action below now follows one shape: run the mutation inside
 * try/catch and capture *only a plain result value* (never redirect
 * from inside it), then call flashRedirect exactly once, after the
 * try/catch has fully exited.
 */
function flashRedirect(path: string, params: Record<string, string>): never {
  const search = new URLSearchParams(params).toString();
  redirect(`${path}?${search}`);
}

type ActionResult = { success: string } | { error: string };

function toResultParams(result: ActionResult): Record<string, string> {
  return "success" in result ? { success: result.success } : { error: result.error };
}

/** Redirects straight to login rather than throwing a bare, uncaught error — this is called outside any try/catch at every call site below, so the redirect is never at risk of being caught by a sibling catch. */
async function requireSession(): Promise<void> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await createCategory(String(formData.get("name") ?? ""));
    revalidatePath("/topics");
    result = { success: "Category created." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/categories", toResultParams(result));
}

export async function renameCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await renameCategory(String(formData.get("id") ?? ""), String(formData.get("name") ?? ""));
    revalidatePath("/topics");
    revalidatePath("/");
    result = { success: "Category renamed." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/categories", toResultParams(result));
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await deleteCategory(String(formData.get("id") ?? ""), String(formData.get("reassignTo") ?? "") || undefined);
    revalidatePath("/topics");
    revalidatePath("/");
    result = { success: "Category deleted." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/categories", toResultParams(result));
}

export async function createTagAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await createTag(String(formData.get("name") ?? ""));
    result = { success: "Tag created." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/tags", toResultParams(result));
}

export async function renameTagAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await renameTag(String(formData.get("id") ?? ""), String(formData.get("name") ?? ""));
    revalidatePath("/topics");
    result = { success: "Tag renamed." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/tags", toResultParams(result));
}

export async function deleteTagAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await deleteTag(String(formData.get("id") ?? ""));
    revalidatePath("/topics");
    result = { success: "Tag deleted." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/tags", toResultParams(result));
}

export async function addMediaAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await addMedia({
      url: String(formData.get("url") ?? ""),
      altText: String(formData.get("altText") ?? ""),
      caption: String(formData.get("caption") ?? "") || undefined,
    });
    result = { success: "Image added to the library." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/media", toResultParams(result));
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  await requireSession();
  let result: ActionResult;
  try {
    await deleteMedia(String(formData.get("id") ?? ""));
    result = { success: "Removed from the library." };
  } catch (error) {
    result = { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  flashRedirect("/admin/media", toResultParams(result));
}
