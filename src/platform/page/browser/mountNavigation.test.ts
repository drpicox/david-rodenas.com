// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Site } from "../../content/Site";
import { renderDocument } from "../renderDocument";
import { mountNavigation } from "./mountNavigation";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n[Below](#below)\n\n## Below\n\nThe end." },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\n---\nThings made." },
]);

/** The document the build writes for a route, with the navigation mounted on it. */
function opened(route: string) {
  const page = site.at(route);
  if (!page) throw new Error(`no page at ${route}`);
  const html = renderDocument(site, page, { origin: "https://example.com" });
  document.replaceChild(document.adoptNode(new DOMParser().parseFromString(html, "text/html").documentElement), document.documentElement);
  window.history.replaceState(null, "", route);
  const arrived: string[] = [];
  mountNavigation(site, (page) => arrived.push(page.route));
  return arrived;
}

describe("moving within one page", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("leaves a link to a place on the same page to the browser, which goes there", () => {
    opened("/");
    const click = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    document.querySelector('main a[href="#below"]')?.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
  });

  it("goes back to a page with the address the history held for it, as it was", () => {
    const arrived = opened("/");
    window.history.pushState(null, "", "/projects/#below");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(arrived).toEqual(["/projects/"]);
    expect(window.location.hash).toBe("#below");
  });

  it("keeps the page as it is when the history moves only within it", () => {
    const arrived = opened("/");
    document.querySelector("main")?.setAttribute("data-touched", "yes");
    window.history.pushState(null, "", "/#below");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(document.querySelector("main")?.getAttribute("data-touched")).toBe("yes");
    expect(arrived).toEqual([]);
  });
});
