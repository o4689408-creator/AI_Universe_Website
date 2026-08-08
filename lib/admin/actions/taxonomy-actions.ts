"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin/auth";
import { createCategory, renameCategory, deleteCategory } from "@/lib/admin/categories";
import { createTag, renameTag, deleteTag } from "@/lib/admin/tags";
import { addMedia, deleteMedia } from "@/lib/admin/media";

async function requireSession(): Promise<void> {
  const session = await getAdminSession();
  if (!session) throw new Error("Not authenticated.");
}

function flashRedirect(path: string, params: Record<string, string>): never {
  const search = new URLSearchParams(params).toString();
  redirect(`${path}?${search}`);
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await createCategory(String(formData.get("name") ?? ""));
    revalidatePath("/topics");
    flashRedirect("/admin/categories", { success: "Category created." });
  } catch (error) {
    flashRedirect("/admin/categories", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}

export async function renameCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await renameCategory(String(formData.get("id") ?? ""), String(formData.get("name") ?? ""));
    revalidatePath("/topics");
    revalidatePath("/");
    flashRedirect("/admin/categories", { success: "Category renamed." });
  } catch (error) {
    flashRedirect("/admin/categories", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await deleteCategory(String(formData.get("id") ?? ""), String(formData.get("reassignTo") ?? "") || undefined);
    revalidatePath("/topics");
    revalidatePath("/");
    flashRedirect("/admin/categories", { success: "Category deleted." });
  } catch (error) {
    flashRedirect("/admin/categories", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}

export async function createTagAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await createTag(String(formData.get("name") ?? ""));
    flashRedirect("/admin/tags", { success: "Tag created." });
  } catch (error) {
    flashRedirect("/admin/tags", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}

export async function renameTagAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await renameTag(String(formData.get("id") ?? ""), String(formData.get("name") ?? ""));
    revalidatePath("/topics");
    flashRedirect("/admin/tags", { success: "Tag renamed." });
  } catch (error) {
    flashRedirect("/admin/tags", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}

export async function deleteTagAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await deleteTag(String(formData.get("id") ?? ""));
    revalidatePath("/topics");
    flashRedirect("/admin/tags", { success: "Tag deleted." });
  } catch (error) {
    flashRedirect("/admin/tags", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}

export async function addMediaAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await addMedia({
      url: String(formData.get("url") ?? ""),
      altText: String(formData.get("altText") ?? ""),
      caption: String(formData.get("caption") ?? "") || undefined,
    });
    flashRedirect("/admin/media", { success: "Image added to the library." });
  } catch (error) {
    flashRedirect("/admin/media", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  await requireSession();
  try {
    await deleteMedia(String(formData.get("id") ?? ""));
    flashRedirect("/admin/media", { success: "Removed from the library." });
  } catch (error) {
    flashRedirect("/admin/media", { error: error instanceof Error ? error.message : "Something went wrong." });
  }
}
