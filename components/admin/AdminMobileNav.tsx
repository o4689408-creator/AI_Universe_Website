"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/admin/AdminSidebar";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change and lock body scroll while open — same
  // approach as the public site's MobileNav.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="relative z-[60] flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast hover:text-text-primary lg:hidden"
      >
        <span className="relative flex h-4 w-5 flex-col justify-between">
          <span
            className={cn(
              "h-[1.5px] w-full rounded-full bg-current transition-transform duration-base ease-out",
              open && "translate-y-[7px] rotate-45"
            )}
          />
          <span
            className={cn(
              "h-[1.5px] w-full rounded-full bg-current transition-opacity duration-base ease-out",
              open && "opacity-0"
            )}
          />
          <span
            className={cn(
              "h-[1.5px] w-full rounded-full bg-current transition-transform duration-base ease-out",
              open && "-translate-y-[7px] -rotate-45"
            )}
          />
        </span>
      </button>

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-[100] bg-bg-base/95 backdrop-blur-md transition-opacity duration-base ease-out lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav className="flex h-full flex-col gap-1 overflow-y-auto p-6 pt-24">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-4 py-3.5 text-body font-medium transition-colors duration-fast",
                  isActive ? "bg-accent/10 text-accent" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-accent" : "text-text-tertiary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
