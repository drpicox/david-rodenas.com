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
    expect(render("/work/")).toContain('<a class="entry" href="/work/orion/">');
    expect(render("/work/orion/")).not.toContain('class="listing"');
  });

  it("does not list the root twice: its directory is the navigation", () => {
    expect(render("/")).not.toContain('class="listing"');
  });

  it("leaves a disc of character cells for the world, so a reader without a script sees a shape and not a hole", () => {
    const html = render("/");
    const mark = /<pre class="planet" aria-hidden="true">([\s\S]*?)<\/pre>/.exec(html)?.[1] ?? "";
    const lines = mark.split("\n");
    expect(lines).toHaveLength(12);
    expect(Math.max(...lines.map((line) => line.length))).toBe(24);
    expect(lines[6]).toMatch(/^░+$/);
    expect(lines[0]?.trim()).toMatch(/^░+$/);
    expect(lines[0]!.length).toBeLessThan(lines[6]!.length);
  });

  it("opens the session on one line, the way a shell puts the user in the prompt: @drpicox ~ $ ls", () => {
    const html = render("/work/");
    expect(html).toContain('<p class="ran"><a class="brand" href="/">@drpicox</a> <span class="ps1">~ $</span> ls</p>');
    expect(html).not.toContain('<a class="brand" href="/">@drpicox</a>\n');
  });

  it("navigates with what ls prints at the root: the home page by its file name, then the directories, in the author's order", () => {
    const html = render("/work/");
    expect(html).toContain('<span class="ps1">~ $</span> ls</p>');
    expect(html).toContain('<a class="navlink" href="/">README.md</a>');
    expect(html).toContain('<a class="navlink" href="/notes/">notes/</a>');
    expect(html).toContain('<a class="navlink" href="/work/" aria-current="page">work/</a>');
    expect(html.indexOf('href="/"')).toBeLessThan(html.indexOf('href="/notes/"'));
    expect(html.indexOf('href="/notes/"')).toBeLessThan(html.indexOf('href="/work/"'));
  });

  it("marks where in the navigation the reader is, and the home page only at home", () => {
    expect(render("/work/orion/")).toContain('href="/work/" aria-current="page"');
    expect(render("/work/orion/")).not.toContain('href="/" aria-current');
    expect(render("/")).toContain('href="/" aria-current="page"');
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

  it("shows the command that printed the page, on every page", () => {
    expect(render("/work/orion/")).toContain("cd work/orion &amp;&amp; cat README.md");
    expect(render("/")).toContain("$</span> cat README.md");
  });

  it("escapes what content could otherwise smuggle into the head", () => {
    const risky = new Site([{ file: "index.md", markdown: '---\ntitle: a" onload="x\n---\nhi' }]);
    const page = risky.at("/");
    expect(page).toBeDefined();
    expect(renderDocument(risky, page!, assets)).not.toContain('onload="x');
  });
});

describe("the document and the shell", () => {
  it("ends every page with a real prompt, at the page's own path, with its cursor in place", () => {
    const html = render("/work/orion/");
    expect(html).toContain('<form class="prompt"><span class="ps1">~/work/orion $</span>');
    expect(html).toContain('<span class="cursor" aria-hidden="true"></span>');
    expect(html.indexOf('class="terminal"')).toBeGreaterThan(html.indexOf("</footer>"));
  });

  it("prints what the shell says on the paper itself, after the page and before the footer, not inside the prompt", () => {
    const html = render("/");
    const screen = html.indexOf('<div class="screen"');
    expect(screen).toBeGreaterThan(html.indexOf("</main>"));
    expect(screen).toBeLessThan(html.indexOf("<footer"));
    expect(html.indexOf('<section class="terminal">')).toBeGreaterThan(html.indexOf("</footer>"));
  });

  it("runs the prompt line from edge to edge: it stands outside the column, and carries the column inside it", () => {
    const html = render("/");
    expect(html).toContain('</footer>\n</div>\n<section class="terminal">\n<div class="column">');
  });

  it("ends the paper with the prompt it is at, so the page reads as a session down to its last line", () => {
    const html = render("/work/orion/");
    const end = html.indexOf(
      '<p class="ran end"><span class="ps1">~/work/orion $</span> <span class="line"><span class="typed"></span><span class="ghost" aria-hidden="true"></span></span></p>',
    );
    expect(end).toBeGreaterThan(html.indexOf('<div class="screen"'));
    expect(end).toBeLessThan(html.indexOf("<footer"));
  });

  it("shows the prompt only where a script can answer it: the head marks the page as scripted before it is painted", () => {
    const html = render("/");
    expect(html.indexOf('classList.add("js")')).toBeLessThan(html.indexOf("<body>"));
    expect(html).not.toContain('<section class="terminal" hidden>');
  });

  it("sends the footer's links to their own tab", () => {
    expect(render("/")).toContain('href="https://github.com/drpicox" target="_blank" rel="noopener noreferrer"');
  });

  it("keeps the footer's links in one group, so a narrow screen wraps them together and not one by one", () => {
    const social = /<span class="social">([\s\S]*?)<\/span>/.exec(render("/"))?.[1];
    expect(social).toBeDefined();
    expect(social).toContain("github.com/drpicox");
    expect(social).toContain("drpicox.medium.com");
    expect(social).toContain("linkedin.com/in/davidrodenas");
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
