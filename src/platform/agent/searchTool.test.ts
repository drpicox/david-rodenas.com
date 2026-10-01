import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { searchTool } from "./searchTool";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n\nA site about tests and rockets.\n" },
  { file: "essays.md", markdown: "---\ntitle: Essays\nsummary: Written every Saturday.\n---\n# Essays\n\n- [The Unit Test Trap](https://medium.com/p/4a83e4012b17)\n- **Coverage** is not a target.\n" },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\n---\n# Projects\n" },
  { file: "projects/rocket.md", markdown: "---\ntitle: Rocket\nsummary: A relativistic rocket.\n---\n# Rocket\n\nHow long a trip takes.\n" },
]);

const found = async (input: Record<string, unknown>) => (await searchTool.answer(input, { site, origin: "https://david-rodenas.com" })) as { summary: string; data: { pages: { path: string; title: string; lines: string[] }[] } };

describe("searching the site, as an agent does", () => {
  it("finds the pages that say every word asked, whatever their case, the ones named for it first", async () => {
    const { data } = await found({ query: "Rocket" });
    expect(data.pages.map((page) => page.path)).toEqual(["/projects/rocket/", "/"]);
  });

  it("gives each page's title, summary and the lines that say it, as the sentences they are", async () => {
    const { data } = await found({ query: "unit test" });
    expect(data.pages).toEqual([{ path: "/essays/", title: "Essays", summary: "Written every Saturday.", lines: ["- The Unit Test Trap"] }]);
  });

  it("looks only under a directory when given one", async () => {
    const { data } = await found({ query: "trip", under: "/projects/" });
    expect(data.pages.map((page) => page.path)).toEqual(["/projects/rocket/"]);
    expect((await found({ query: "tests", under: "projects" })).data.pages).toEqual([]);
  });

  it("says in words how many pages it found", async () => {
    expect((await found({ query: "coverage" })).summary).toBe('1 page says "coverage": Essays.');
    expect((await found({ query: "nothing like this" })).summary).toBe('No page says "nothing like this".');
  });

  it("refuses to look for nothing", async () => {
    expect(await searchTool.answer({ query: "  " }, { site, origin: "https://david-rodenas.com" })).toEqual({ refused: "query: say what to look for" });
  });

  it("shows the reader nothing and changes nothing", () => {
    expect(searchTool.shows).toBe(false);
    expect(searchTool.readOnly).toBe(true);
  });
});
