import type { Feature } from "../../platform/plugin/Feature";
import { BrowserTheme } from "./browser/BrowserTheme";
import { mountThemeToggle } from "./browser/mountThemeToggle";
import { settleTheme } from "./browser/settleTheme";
import { themeCommand } from "./themeCommand";

/**
 * The colours of the page: the command, the button, and the one rule that
 * decides between what a page insists on and what a reader chose.
 *
 * This is the whole of it. The frame does not know the word "dark" — it only
 * carries `data-page-theme` from the front matter to the root element, because
 * that has to be right before a stylesheet paints. What it means is here.
 */
export const themeFeature: Feature = {
  name: "theme",
  commands: [themeCommand(new BrowserTheme())],
  install: (prompt) => mountThemeToggle(() => prompt.run("theme")),
  // A new page may insist on its own; the reader's choice has to be weighed against it again.
  arrive: () => settleTheme(),
};
