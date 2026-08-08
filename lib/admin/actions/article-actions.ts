"use server";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import {
  createArticle,
  updateArticle,
  setArticleStatus,
  deleteArticle,
  getArticleDocById,
  autosaveArticle,
} from "@/lib/admin/articles";
import { ArticleValidationError } from "@/lib/admin/validation";
import { revalidateArticlePaths } from "@/lib/admin/revalidate";
import { parseArticleFormData } from "@/lib/admin/form-parsing";
import type { ArticleInput, ArticleStatus } from "@/types/admin";

export interface ArticleFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

/** Every Server Action here re-checks the session itself — middleware.ts and the dashboard layout both already gate access, but a mutation is exactly the place to never rely on an outer layer alone. */
async function requireSessionOrThrow(): Promise<void> {
  const session = await getAdminSession();
  if (!session) throw new Error("Not authenticated.");
}



/**
 * Handles both create and edit: presence of a non-empty `id` field
 * means "update that article," otherwise "create a new one." The
 * clicked submit button's `intent` ("draft" | "publish") sets status —
 * HTML natively includes the activated submit button's name/value pair
 * in the FormData, so the Article form (components/admin/ArticleForm.tsx)
 * can offer both "Save Draft" and "Publish" buttons on one form without
 * any client-side JS deciding which action to call.
 */
export async function saveArticleAction(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  try {
    await requireSessionOrThrow();
  } catch {
    return { error: "Your session expired. Please log in again." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const intent = String(formData.get("intent") ?? "draft") as ArticleStatus;
  const input = parseArticleFormData(formData);

  try {
    if (id) {
      const existing = await getArticleDocById(id);
      await updateArticle(id, input);
      // A save can change status too (Save Draft / Mark Ready / Schedule
      // / Publish are all valid buttons on the same form) — but
      // stepping DOWN in status (e.g. re-saving a published article
      // without touching status) is never a side effect of a plain
      // edit; only the explicit status buttons and Unpublish do that.
      if (intent !== existing?.status) {
        if (intent === "scheduled") {
          await setArticleStatus(id, "scheduled", input.scheduledFor);
        } else if (intent === "published" || intent === "ready") {
          await setArticleStatus(id, intent);
        }
      }
      revalidateArticlePaths([existing?.slug, input.slug]);
    } else {
      const initialStatus = intent === "draft" ? "draft" : "draft"; // always create as draft first
      const created = await createArticle(input, initialStatus);
      if (intent !== "draft") {
        await setArticleStatus(created._id.toString(), intent, input.scheduledFor);
      }
      revalidateArticlePaths([created.slug]);
    }
  } catch (error) {
    if (error instanceof ArticleValidationError) {
      return { error: "Please fix the highlighted fields.", fieldErrors: error.fieldErrors };
    }
    return { error: error instanceof Error ? error.message : "Something went wrong." };
  }

  redirect("/admin/articles");
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requireSessionOrThrow();
  const id = String(formData.get("id") ?? "");
  const deleted = await deleteArticle(id);
  if (deleted) revalidateArticlePaths([deleted.slug]);
  redirect("/admin/articles");
}

export async function setArticleStatusAction(formData: FormData): Promise<void> {
  await requireSessionOrThrow();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ArticleStatus;
  const scheduledFor = String(formData.get("scheduledFor") ?? "") || undefined;

  try {
    const updated = await setArticleStatus(id, status, scheduledFor);
    revalidateArticlePaths([updated.slug]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    redirect(`/admin/articles?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/articles");
}

export interface AutosaveResult {
  id?: string;
  savedAt?: string;
  error?: string;
}

/**
 * Called directly from the editor's debounced autosave effect (not a
 * <form> submit) — plain function Server Actions work for this exactly
 * like form actions do. Returns the article's id so a brand-new,
 * never-saved draft gets one after its first autosave, and every
 * autosave after that updates the same document instead of creating
 * duplicates.
 */
export async function autosaveArticleAction(
  id: string | undefined,
  partial: Partial<ArticleInput>
): Promise<AutosaveResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Your session expired. Please log in again." };

  try {
    const result = await autosaveArticle(id, partial);
    if (!result) return {};
    return { id: result.id, savedAt: result.savedAt };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Autosave failed." };
  }
}
