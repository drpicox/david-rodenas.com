const KEY = "theme";

/**
 * What the root should say now: the page's own theme if it insists on one,
 * else what the reader chose, else nothing, which is the system's choice.
 */
export function settleTheme(): void {
  const root = document.documentElement;
  const forced = root.dataset["pageTheme"];
  let chosen: string | null = null;
  try {
    chosen = localStorage.getItem(KEY);
  } catch {
    chosen = null;
  }
  const theme = forced ?? (chosen === "light" || chosen === "dark" ? chosen : null);
  if (theme) root.dataset["theme"] = theme;
  else delete root.dataset["theme"];
}
