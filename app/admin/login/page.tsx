import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `Admin Login — ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-body-sm font-medium uppercase tracking-wide text-text-tertiary">
            {SITE_NAME}
          </p>
          <h1 className="mt-2 text-heading-3 font-semibold tracking-tight text-text-primary">
            Admin
          </h1>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface-1/60 p-8 shadow-lg backdrop-blur-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
