"use client";

import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, setStoredTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  // Read the real stored value after mount — the inline no-flash script
  // (see app/layout.tsx) already applied it to the DOM before paint;
  // this just syncs this component's own icon state to match.
  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    setStoredTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast hover:text-text-primary"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5v1.3M8 13.2v1.3M14.5 8h-1.3M2.8 8H1.5M12.4 3.6l-.9.9M4.5 11.5l-.9.9M12.4 12.4l-.9-.9M4.5 4.5l-.9-.9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
