import type { ThemeChoice } from "./ThemeChoice";

/**
 * The colours of the page, to whoever is asking for them.
 *
 * The command below this is about words: which ones are choices, what to say
 * back, when to refuse. Doing the thing needs a browser — storage, a root
 * element, a system preference to fall back on — and this is the line between
 * them. In the browser it is `BrowserTheme`; in a test it is four lines.
 */
export interface Theme {
  /** Takes a choice, and answers what the page settled on. A toggle only it can resolve. */
  apply(choice: ThemeChoice): "light" | "dark" | "system";
}
