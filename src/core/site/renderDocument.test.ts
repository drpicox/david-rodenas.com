import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { renderDocument } from "./renderDocument";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# I build the foundations\n\nHello." },
  { file: "work/index.md", markdown: "---\ntitle: Work\nsummary: Five times\n---\n## Five times" },
  { file: "work/orion.md", markdown: "---\ntitle: Orion\nsummary: A plugin kernel\n---\nA kernel." },
  { file: "notes.md", markdown: "---\ntitle: Loose notes\n---\nLoose." },
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
    expect(render("/")).toContain('<link rel="icon" type="image/png" href="/favicon.png">');
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

  it("does not list the root twice: its directory is the navigation", () => {
    expect(render("/")).not.toContain('class="listing"');
  });

  it("navigates to what sits at the root by name, as ls would, in the author's order", () => {
    const html = render("/");
    expect(html).toContain('<a class="navlink" href="/notes/">NOTES</a>');
    expect(html).toContain('<a class="navlink" href="/work/">WORK</a>');
    expect(html.indexOf('href="/notes/"')).toBeLessThan(html.indexOf('href="/work/"'));
  });

  it("marks where in the navigation the reader is", () => {
    expect(render("/work/orion/")).toContain('href="/work/" aria-current="page"');
    expect(render("/")).not.toContain("aria-current");
  });

  it("describes a book to the machines that catalogue books", () => {
    const shelf = new Site([
      { file: "index.md", markdown: "---\ntitle: Home\n---\nhi" },
      {
        file: "book/index.md",
        markdown: "---\ntitle: A Guide\nisbn: 978-1\npublished: 2024-10-19\npages: 156\ncover: /book/c.jpeg\n---\nText.",
      },
    ]);
    const page = shelf.at("/book/");
    const html = renderDocument(shelf, page!, assets);
    expect(html).toContain('<script type="application/ld+json">');
    const json = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)![1]!);
    expect(json).toMatchObject({
      "@type": "Book",
      name: "A Guide",
      isbn: "978-1",
      datePublished: "2024-10-19",
      numberOfPages: 156,
      image: "https://david-rodenas.com/book/c.jpeg",
      author: { "@type": "Person", name: "David Rodenas" },
    });
    expect(render("/work/orion/")).not.toContain("ld+json");
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

describe("the document and the shell", () => {
  it("offers a real prompt, at the page's own path, hidden until a script can answer it", () => {
    expect(render("/")).toContain('<section class="terminal" hidden>');
    expect(render("/")).toContain('<span class="ps1">~ $</span>');
    expect(render("/work/orion/")).toContain('<span class="ps1">~/work/orion $</span>');
  });

  it("sends the footer's links to their own tab", () => {
    expect(render("/")).toContain('href="https://github.com/drpicox" target="_blank" rel="noopener noreferrer"');
  });

  it("has a theme button in the header, in its place from the start, that only a script makes visible", () => {
    expect(render("/")).toContain('<button class="theme-toggle" type="button" aria-hidden="true"');
  });

  it("applies a remembered theme before anything is painted", () => {
    const html = render("/");
    expect(html.indexOf('localStorage.getItem("theme")')).toBeLessThan(html.indexOf("<body>"));
    expect(html).toContain("dataset.pageTheme");
  });
});

describe("counting visits", () => {
  it("keeps the GoatCounter the 2025 site had, loaded last and asynchronously", () => {
    const html = render("/");
    expect(html).toContain('data-goatcounter="https://drpicox.goatcounter.com/count"');
    expect(html.indexOf("gc.zgo.at/count.js")).toBeGreaterThan(html.indexOf("</main>"));
  });
});

describe("typing before the script arrives", () => {
  it("is caught from the first byte of the page, so nothing typed is lost", () => {
    const html = render("/");
    expect(html.indexOf("window.__typed")).toBeLessThan(html.indexOf("<body>"));
  });
});

describe("a page with its own sky", () => {
  const sky = new Site([
    { file: "index.md", markdown: "---\ntitle: Home\n---\nhi" },
    { file: "worlds/index.md", markdown: "---\ntitle: Worlds\ntheme: dark\nsky: stars\n---\nstars" },
  ]);

  it("is dark from the first byte, and says so, and has stars", () => {
    const html = renderDocument(sky, sky.at("/worlds/")!, assets);
    expect(html).toContain('<html lang="en" data-theme="dark" data-page-theme="dark" data-sky="stars">');
  });

  it("leaves every other page to the reader's choice", () => {
    expect(renderDocument(sky, sky.at("/")!, assets)).toContain('<html lang="en">');
  });
});
