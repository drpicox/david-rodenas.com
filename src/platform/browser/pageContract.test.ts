// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Site } from "../content/Site";
import { APPEARANCE } from "../page/APPEARANCE";
import { renderDocument } from "../page/renderDocument";
import { mountNavigation } from "./mountNavigation";
import { mountTerminal } from "./mountTerminal";

/**
 * The page the build writes in node, and the scripts that take it over in the
 * browser, agree on its markup, and no import says so: the terminal looks for
 * the prompt the build wrote, and the navigation rebuilds, without a load,
 * what the build would have written. These are that agreement, written down
 * where breaking it fails.
 */
const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n\nHello." },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\nsummary: What was made\n---\n## Projects" },
  { file: "projects/night.md", markdown: "---\ntitle: Night\ntheme: dark\nsky: stars\n---\nStars." },
]);

const written = (route: string): Document => {
  const page = site.at(route);
  if (!page) throw new Error(`no page at ${route}`);
  return new DOMParser().parseFromString(renderDocument(site, page, { origin: "https://example.com" }), "text/html");
};

/** The document the build wrote for a route, as a browser would have loaded it. */
function load(route: string): void {
  document.replaceChild(document.adoptNode(written(route).documentElement), document.documentElement);
  window.history.replaceState(null, "", route);
}

const lit = (root: Document) => [...root.querySelectorAll('nav .navlink[aria-current="page"]')].map((link) => link.getAttribute("href"));

describe("the page the build writes, and the browser that takes it over", () => {
  beforeEach(() => {
    // jsdom lays nothing out, so it has nowhere to scroll to.
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Element.prototype.scrollIntoView ??= () => {};
  });

  it("gives the terminal every part of the prompt it looks for, and a screen to answer on", () => {
    load("/projects/");
    const terminal = mountTerminal(site, "/projects/");
    expect(terminal, "the terminal found everything it needs on the page").not.toBeNull();
    terminal?.run("pwd");
    expect(document.querySelector(".screen")?.textContent).toContain("~/projects");
  });

  it("is, after a link followed without a load, the page a load would have given", () => {
    load("/");
    const goTo = mountNavigation(site, () => {});
    expect(goTo("/projects/night/")).toBe(true);
    const loaded = written("/projects/night/");
    expect(document.title).toBe(loaded.title);
    expect(document.querySelector("main")?.innerHTML.trim()).toBe(loaded.querySelector("main")?.innerHTML.trim());
    expect(lit(document)).toEqual(lit(loaded));
    for (const attribute of APPEARANCE) expect(document.documentElement.getAttribute(attribute), attribute).toBe(loaded.documentElement.getAttribute(attribute));
  });

  it("keeps the prompt saying where the page is, as the build would have written it there", () => {
    load("/");
    const terminal = mountTerminal(site, "/");
    // As the composition root wires them: a move made by a link is news to the shell.
    const goTo = mountNavigation(site, (page, kept) => {
      if (!kept) terminal?.moveTo(page.route);
    });
    goTo("/projects/");
    const loaded = written("/projects/");
    expect(document.querySelector(".terminal .ps1")?.textContent).toBe(loaded.querySelector(".terminal .ps1")?.textContent);
    expect(document.querySelector(".ran.end .ps1")?.textContent).toBe(loaded.querySelector(".ran.end .ps1")?.textContent);
  });
});
