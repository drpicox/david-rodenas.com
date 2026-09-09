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

  it("opens the home page with the command that prints it, so the page reads as a session from its first line", () => {
    expect(renderMain(site, site.at("/")!)).toContain('<p class="ran"><span class="ps1">~ $</span> cat README.md</p>');
  });

  it("can open with the very command that was typed, when a page is shown from the shell", () => {
    const html = renderMain(site, site.at("/work/orion/")!, { prompt: "~/work $", command: "cat orion/README.md" });
    expect(html).toContain('<p class="ran"><span class="ps1">~/work $</span> cat orion/README.md</p>');
    expect(html).not.toContain("cd work/orion");
  });

  it("is what the whole document carries, so a page can be swapped in place", () => {
    expect(renderMain(site, site.at("/")!)).toContain("<h1");
    expect(renderMain(site, site.at("/")!)).not.toContain("<main>");
  });
});
