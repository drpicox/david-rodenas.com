import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import { pagesFound } from "./pagesFound";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n\nA few things about the sea, and nights.\n" },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\nsummary: Small things.\n---\n# Projects\n" },
  {
    file: "projects/hot-nights.md",
    markdown: "---\ntitle: Hot nights, counted\nsummary: How many nights never cool.\n---\n# Hot nights\n\nThe first of them, Francesc Salvà, in his house.\n\n```::blueprint\nnights = weather-days station: WU\n```\n\nA torrid night is one at 25 °C or more.\n",
  },
  { file: "projects/sea.md", markdown: "---\ntitle: The sea, a day at a time\nsummary: The sea's surface.\n---\n# The sea\n\nA warm sea goes with warm nights.\n" },
]);

describe("the pages that say what is looked for", () => {
  it("are the pages that say every word, the ones whose title says them first", () => {
    expect(pagesFound(site, "nights").map(({ route }) => route)).toEqual(["/projects/hot-nights/", "/", "/projects/sea/"]);
    expect(pagesFound(site, "warm nights").map(({ route }) => route)).toEqual(["/projects/sea/"]);
  });

  it("find a word whatever its case and accents", () => {
    expect(pagesFound(site, "SALVA").map(({ route }) => route)).toEqual(["/projects/hot-nights/"]);
  });

  it("say where each page stands, what it is, and the line that says the most of the words, never one of a program's", () => {
    const [found] = pagesFound(site, "torrid night");
    expect(found).toEqual({ route: "/projects/hot-nights/", title: "Hot nights, counted", summary: "How many nights never cool.", section: "projects", line: "A torrid night is one at 25 °C or more." });
    expect(pagesFound(site, "station")).toEqual([]);
  });

  it("say the summary when only the title or the summary has the words", () => {
    expect(pagesFound(site, "surface")[0]?.line).toBe("The sea's surface.");
  });

  it("find a word where a word of the page starts with it, never inside one: rain is not found in brain", () => {
    const brain = new Site([{ file: "index.md", markdown: "---\ntitle: Home\n---\nTechnical debt is brain debt.\n" }, { file: "rain.md", markdown: "---\ntitle: Rainfall\n---\nIt rains.\n" }]);
    expect(pagesFound(brain, "rain").map(({ route }) => route)).toEqual(["/rain/"]);
  });

  it("put a page that says the word itself before one that only says longer words starting with it", () => {
    const seas = new Site([
      { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n" },
      { file: "a.md", markdown: "---\ntitle: A\n---\nEvery season, and the seasons after it.\n" },
      { file: "b.md", markdown: "---\ntitle: B\n---\nThe sea.\n" },
    ]);
    expect(pagesFound(seas, "sea").map(({ route }) => route)).toEqual(["/b/", "/a/"]);
  });

  it("are none for nothing looked for", () => {
    expect(pagesFound(site, "   ")).toEqual([]);
  });
});
