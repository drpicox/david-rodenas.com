import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { readTool } from "./readTool";

const nothingServed = () => Promise.reject(new Error("no files here"));

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\nsummary: Where it starts.\n---\n# Home\n\nSee [the projects](/projects/).\n" },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\nsummary: Things made.\n---\n# Projects\n" },
  { file: "projects/rocket.md", markdown: "---\ntitle: Rocket\nsummary: A relativistic rocket.\n---\n# Rocket\n\n::rocket\n" },
]);

describe("reading a page, as an agent does", () => {
  it("gives its words as the markdown they are written in, links and all, and the address of the page", async () => {
    expect(await readTool.answer({ path: "/" }, { site, origin: "https://david-rodenas.com", read: nothingServed })).toMatchObject({
      summary: "Home: Where it starts.",
      data: { title: "Home", summary: "Where it starts.", markdown: "# Home\n\nSee [the projects](/projects/)." },
      route: "/",
    });
  });

  it("lists the pages under it, by the path that reads each of them", async () => {
    expect(await readTool.answer({ path: "/projects/" }, { site, origin: "https://david-rodenas.com", read: nothingServed })).toMatchObject({
      data: { pages: [{ path: "/projects/rocket/", title: "Rocket", summary: "A relativistic rocket." }] },
    });
  });

  it("finds the page by its whole URL as well as by its path", async () => {
    expect(await readTool.answer({ path: "https://david-rodenas.com/projects/rocket/" }, { site, origin: "https://david-rodenas.com", read: nothingServed })).toMatchObject({ route: "/projects/rocket/" });
  });

  it("refuses a path with no page, and says what finds one", async () => {
    expect(await readTool.answer({ path: "/nowhere/" }, { site, origin: "https://david-rodenas.com", read: nothingServed })).toEqual({ refused: "no page at /nowhere/: search finds pages by what they say" });
  });

  it("shows the reader nothing and changes nothing", () => {
    expect(readTool.shows).toBe(false);
    expect(readTool.readOnly).toBe(true);
  });
});
