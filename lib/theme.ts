import { readStorage, writeStorage } from "@/lib/storage";

export type Theme = "dark" | "light";

const STORAGE_KEY = "au:theme";

/**
 * Dark is the default for every visitor, always — this deliberately
 * never reads `prefers-color-scheme`. Only an explicit toggle
 * (ThemeToggle) ever produces "light"; nothing here auto-switches
 * based on OS/browser preference, per the explicit requirement that
 * dark remains the default even for users whose system is set to light.
 */
export function getStoredTheme(): Theme {
  return readStorage<Theme>(STORAGE_KEY, "dark");
}

export function setStoredTheme(theme: Theme): void {
  writeStorage(STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

/**
 * The exact script string inlined into <head> (see app/layout.tsx) to
 * apply the stored theme before first paint — without this, the page
 * would flash dark-then-light for visitors who previously chose light
 * mode. Deliberately minimal and defensive (try/catch — must never
 * throw and break page load).
 */
export const noFlashThemeScript = `
(function() {
  try {
    var theme = localStorage.getItem("${STORAGE_KEY}");
    if (theme) {
      var parsed = JSON.parse(theme);
      if (parsed === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      }
    }
  } catch (e) {}
})();
`;
