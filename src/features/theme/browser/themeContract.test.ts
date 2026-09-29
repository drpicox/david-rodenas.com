// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { Site } from "../../../platform/content/Site";
import { renderDocument } from "../../../platform/page/renderDocument";
import { settleTheme } from "./settleTheme";

/**
 * Two scripts put the theme on the page, and no import joins them: the one the
 * document carries in its head, which runs before the first paint so that a
 * dark page is never white for an instant, and the theme's own, which settles
 * it once the page's script is there. They have to agree on where the choice
 * is kept, what it may be, and that a page insisting on a theme wins; or the
 * page would paint one theme and then jump to another.
 */
const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\nHome." },
  { file: "night.md", markdown: "---\ntitle: Night\ntheme: dark\n---\nStars." },
]);

/** The document the build writes for a route, loaded, with the script in its head run as a browser runs it, before anything is painted. */
function painted(route: string): string | undefined {
  const page = site.at(route);
  if (!page) throw new Error(`no page at ${route}`);
  const html = renderDocument(site, page, { origin: "https://example.com" });
  document.replaceChild(document.adoptNode(new DOMParser().parseFromString(html, "text/html").documentElement), document.documentElement);
  const head = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";
  new Function(head)();
  return document.documentElement.dataset["theme"];
}

describe("the theme, as the head paints it and as the theme's script settles it", () => {
  afterEach(() => localStorage.clear());

  for (const route of ["/", "/night/"])
    for (const chosen of [null, "light", "dark", "pink", "sepia"])
      it(`agree on ${route}, with ${chosen ?? "nothing"} chosen`, () => {
        if (chosen) localStorage.setItem("theme", chosen);
        const first = painted(route);
        settleTheme();
        expect(document.documentElement.dataset["theme"]).toBe(first);
      });

  it("keeps the reader's choice where the page does not insist, and the page's where it does", () => {
    localStorage.setItem("theme", "pink");
    expect(painted("/")).toBe("pink");
    expect(painted("/night/")).toBe("dark");
  });
});
