import type { Page } from "./Page";
import type { Site } from "./Site";

/** The page whose markdown makes room for a program — `::name` on a line of its own, or a fenced block named so — where to go to show it. */
export function pageShowing(site: Site, name: string): Page | undefined {
  const place = new RegExp(`^(\`\`\`)?::${name}(\\s+--[a-z0-9-]+)*$`);
  return site.pages.find((page) => page.body.split("\n").some((line) => place.test(line.trim())));
}
