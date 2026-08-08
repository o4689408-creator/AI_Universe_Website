import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { logoutAction } from "@/lib/admin/actions/auth-actions";

export function AdminTopbar({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border-subtle bg-bg-base/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <p className="hidden text-body-sm text-text-tertiary sm:block">
          Signed in as <span className="font-medium text-text-secondary">{email}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md px-3 py-2 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:bg-bg-surface-2 hover:text-text-primary"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
