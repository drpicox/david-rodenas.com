import { Site } from "../../../platform/content/Site";

/** A small site to search, made for tests: a home, a directory, and two pages that say some of the same words. */
export const searchSite = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n" },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\n---\n# Projects\n" },
  { file: "projects/hot-nights.md", markdown: "---\ntitle: Hot nights, counted\nsummary: How many nights never cool.\n---\n# Hot nights\n\nA torrid night is one at 25 °C or more.\n" },
  { file: "projects/sea.md", markdown: "---\ntitle: The sea\nsummary: The sea's surface.\n---\n# The sea\n\nA warm sea goes with warm nights.\n" },
]);
