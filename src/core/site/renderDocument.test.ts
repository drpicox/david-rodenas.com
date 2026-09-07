import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { renderDocument } from "./renderDocument";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# I build the foundations\n\nHello." },
  { file: "work/index.md", markdown: "---\ntitle: Work\nsummary: Five times\n---\n## Five times" },
  { file: "work/orion.md", markdown: "---\ntitle: Orion\nsummary: A plugin kernel\n---\nA kernel." },
]);

const assets = { origin: "https://david-rodenas.com", stylesheet: "/a.css", script: "/a.js" };

function render(route: string): string {
  const page = site.at(route);
  if (!page) throw new Error(`no page at ${route}`);
  return renderDocument(site, page, assets);
}

describe("renderDocument", () => {
  it("puts the words in the HTML, which is the whole reason this exists", () => {
    expect(render("/")).toContain("I build the foundations");
    expect(render("/")).toContain("Hello.");
  });

  it("titles the home page without repeating itself", () => {
    expect(render("/")).toContain("<title>David Rodenas</title>");
    expect(render("/work/orion/")).toContain("<title>Orion — David Rodenas</title>");
  });

  it("describes itself to anything that shares a link", () => {
    const html = render("/work/orion/");
    expect(html).toContain('<meta property="og:title" content="Orion — David Rodenas">');
    expect(html).toContain('<meta property="og:url" content="https://david-rodenas.com/work/orion/">');
    expect(html).toContain('<link rel="canonical" href="https://david-rodenas.com/work/orion/">');
  });

  it("lists what a directory holds, and nothing for a leaf", () => {
    expect(render("/work/")).toContain('<a href="/work/orion/">Orion</a>');
    expect(render("/work/orion/")).not.toContain('class="listing"');
  });

  it("marks where in the navigation the reader is", () => {
    expect(render("/work/orion/")).toContain('href="/work/" aria-current="page"');
    expect(render("/")).not.toContain("aria-current");
  });

  it("shows the command that would have got you here", () => {
    expect(render("/work/orion/")).toContain("cd work/orion");
    expect(render("/")).not.toContain('class="ran"');
  });

  it("escapes what content could otherwise smuggle into the head", () => {
    const risky = new Site([{ file: "index.md", markdown: '---\ntitle: a" onload="x\n---\nhi' }]);
    const page = risky.at("/");
    expect(page).toBeDefined();
    expect(renderDocument(risky, page!, assets)).not.toContain('onload="x');
  });
});
