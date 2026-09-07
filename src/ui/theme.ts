export type ThemeChoice = "light" | "dark" | "system" | "toggle";

const KEY = "theme";

function systemIsDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function current(): "light" | "dark" {
  const chosen = document.documentElement.dataset["theme"];
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
  if (wanted === "system") delete document.documentElement.dataset["theme"];
  else document.documentElement.dataset["theme"] = wanted;
  return wanted;
}
