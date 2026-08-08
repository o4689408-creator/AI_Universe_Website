"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/admin/password";
import { createAdminSession, clearAdminSession } from "@/lib/admin/auth";

export interface LoginActionState {
  error?: string;
}

/**
 * Verifies against ADMIN_EMAIL / ADMIN_PASSWORD_HASH (see .env.example
 * and scripts/create-admin-password.mjs). Single admin account by
 * design — this CMS has exactly one operator today; a multi-admin/role
 * system is a much bigger feature than "stop hand-editing MDX files"
 * calls for and isn't part of this foundation.
 */
export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    return {
      error:
        "Admin login isn't configured yet. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH " +
        "(see .env.example and scripts/create-admin-password.mjs).",
    };
  }

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  // Compare the email in constant-ish time isn't meaningful here (it's
  // not a secret), but the password check below IS timing-safe
  // (verifyPassword uses crypto.timingSafeEqual internally).
  if (email !== adminEmail || !(await verifyPassword(password, adminPasswordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createAdminSession(adminEmail);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  clearAdminSession();
  redirect("/admin/login");
}
