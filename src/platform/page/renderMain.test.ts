import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { renderMain } from "./renderMain";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Hello" },
  { file: "work/index.md", markdown: "---\ntitle: Work\n---\n## Work" },
  { file: "work/orion.md", markdown: "---\ntitle: Orion\nsummary: A kernel\n---\nA kernel." },
]);

describe("renderMain", () => {
  it("is the inside of <main>: the trail, the words, the listing", () => {
    const html = renderMain(site, site.at("/work/")!);
    expect(html).toContain("cd work &amp;&amp; cat *");
    expect(html).toContain("<h2");
    expect(html).toContain('<a href="/work/orion/">Orion</a>');
  });

  it("is what the whole document carries, so a page can be swapped in place", () => {
    expect(renderMain(site, site.at("/")!)).toContain("<h1");
    expect(renderMain(site, site.at("/")!)).not.toContain("<main>");
  });
});
