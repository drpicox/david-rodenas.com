import type { Theme } from "../Theme";
import type { ThemeChoice } from "../ThemeChoice";
import { settleTheme } from "./settleTheme";

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
 * The colours, in a browser: the reader's choice kept in storage, and the root
 * element settled to match. The same head script that runs before paint reads
 * the same key, so a reload does not flash.
 */
export class BrowserTheme implements Theme {
  apply(choice: ThemeChoice): "light" | "dark" | "system" {
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
}
