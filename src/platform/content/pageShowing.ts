import type { Page } from "./Page";
import type { Site } from "./Site";

/** The page whose markdown makes room for a program, `::name` on a line of its own: where to go to show it. */
export function pageShowing(site: Site, name: string): Page | undefined {
  return site.pages.find((page) => page.body.split("\n").some((line) => line.trim() === `::${name}`));
}
