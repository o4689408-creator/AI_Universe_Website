import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export function Logo() {
  return (
    <Link href="/" className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full bg-accent/0 blur-md transition-colors duration-slow ease-out group-hover:bg-accent/25"
          aria-hidden="true"
        />
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="relative transition-transform duration-slow ease-out group-hover:scale-110"
        >
          <rect width="32" height="32" rx="8" className="fill-bg-surface-1" />
          <g stroke="currentColor" strokeWidth="1.2" className="text-accent">
            <path d="M8 22 L14 12 L20 17 L24 9" />
          </g>
          <g fill="currentColor" className="text-accent">
            <circle cx="8" cy="22" r="2.2" />
            <circle cx="14" cy="12" r="2.2" />
            <circle cx="20" cy="17" r="2.2" />
            <circle cx="24" cy="9" r="2.2" />
          </g>
        </svg>
      </span>
      <span className="truncate text-body-lg font-semibold tracking-tight text-text-primary sm:text-heading-4">
        {SITE_NAME}
      </span>
    </Link>
  );
}
