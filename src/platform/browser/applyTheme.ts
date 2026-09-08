import { settleTheme } from "./settleTheme";

export type ThemeChoice = "light" | "dark" | "system" | "toggle";

const KEY = "theme";

function systemIsDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** The reader's own choice, not what a page may be insisting on. */
function current(): "light" | "dark" {
  let chosen: string | null = null;
  try {
    chosen = localStorage.getItem(KEY);
  } catch {
    chosen = document.documentElement.dataset["theme"] ?? null;
  }
  if (chosen === "light" || chosen === "dark") return chosen;
  return systemIsDark() ? "dark" : "light";
}

/**
 * Sets the theme on the root and remembers it. The same head script that
 * runs before paint reads the same key, so a reload does not flash.
 */
export function applyTheme(choice: ThemeChoice): "light" | "dark" | "system" {
  const wanted = choice === "toggle" ? (current() === "dark" ? "light" : "dark") : choice;
  try {
    if (wanted === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, wanted);
  } catch {
    // Without storage the choice still holds until the page is left.
  }
  settleTheme();
  return wanted;
}
