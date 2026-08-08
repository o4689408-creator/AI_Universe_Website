import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Deliberately does NOT check auth — /admin/login lives under this
 * same layout and must stay reachable. The actual auth gate is
 * middleware.ts (edge, first line of defense) plus
 * app/admin/(dashboard)/layout.tsx's requireAdminSession() (second,
 * defense-in-depth layer) for everything else under /admin.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg-base">{children}</div>;
}
