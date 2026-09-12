import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { renderMain } from "./renderMain";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Hello" },
  { file: "work/index.md", markdown: "---\ntitle: Work\n---\n## Work" },
  { file: "work/orion.md", markdown: "---\ntitle: Orion\nsummary: A kernel\n---\nA kernel." },
  { file: "work/vega.md", markdown: "---\ntitle: Vega\n---\nNo summary." },
]);

describe("renderMain", () => {
  it("is the inside of <main>: the command, the words, the listing", () => {
    const html = renderMain(site, site.at("/work/")!);
    expect(html).toContain("cd work &amp;&amp; cat README.md");
    expect(html).toContain("<h2");
    expect(html).toContain('href="/work/orion/"');
  });

  it("opens every page with the command that printed it, the home page included", () => {
    expect(renderMain(site, site.at("/")!)).toContain('<span class="ps1">~ $</span> cat README.md');
    expect(renderMain(site, site.at("/work/orion/")!)).toContain(
      '<span class="ps1">~ $</span> cd work/orion &amp;&amp; cat README.md',
    );
  });

  it("lists a directory the way ls would, at its own prompt, with the name and then what it is", () => {
    const html = renderMain(site, site.at("/work/")!);
    expect(html).toContain('<span class="ps1">~/work $</span> ls');
    expect(html).toContain('<a class="entry" href="/work/orion/"><code>orion/</code><span class="title">Orion</span>');
    expect(html).toContain('<span class="summary">A kernel</span>');
    expect(html).toContain('<code>vega/</code><span class="title">Vega</span></a>');
  });

  it("lists nothing under a page that holds nothing, not even the ls", () => {
    const html = renderMain(site, site.at("/work/orion/")!);
    expect(html).not.toContain("$</span> ls");
    expect(html).not.toContain('class="listing"');
  });

  it("is what the whole document carries, so a page can be swapped in place", () => {
    expect(renderMain(site, site.at("/")!)).toContain("<h1");
    expect(renderMain(site, site.at("/")!)).not.toContain("<main>");
  });
});
