import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import { renderCouplingsFigure } from "./renderCouplingsFigure";
import type { Snapshot } from "./Snapshot";

const PATHS = ["page/render.ts", "browser/terminal.ts", "main.ts", "browser/navigation.ts", "page/render.test.ts", "gone.ts"];
const lives: Life[] = PATHS.map((path, id) => ({ id, path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false, born: 0, changed: [], ...(path === "gone.ts" ? { went: 3 } : {}) }));
// main needs navigation, navigation needs terminal; nothing joins the page and the terminal.
const snapshot: Snapshot = {
  modules: lives.filter((life) => life.went === undefined).map(({ id, path, test }) => ({ id, path, lines: 10, test })),
  dependencies: [
    { from: 2, to: 3, typeOnly: false },
    { from: 3, to: 1, typeOnly: false },
    { from: 4, to: 0, typeOnly: false },
  ],
};
const couplings = [
  { a: 0, b: 1, together: 5 },
  { a: 0, b: 4, together: 5 },
  { a: 1, b: 2, together: 4 },
  { a: 2, b: 3, together: 3 },
  { a: 0, b: 5, together: 3 },
];

describe("the figure of what changes together", () => {
  const figure = renderCouplingsFigure(couplings, lives, snapshot);
  const rows = [...figure.matchAll(/<tr[^>]*><td>(\d+)<\/td><td><code>(.*?)<\/code><\/td><td><code>(.*?)<\/code><\/td><td>([^<]+)<\/td>/g)].map(([, together, a = "", b = "", joined]) => [Number(together), a.replaceAll("<wbr>", ""), b.replaceAll("<wbr>", ""), joined]);

  it("lists the files that ship that changed together most, and says what joins them now", () => {
    expect(rows).toEqual([
      [5, "page/render.ts", "browser/terminal.ts", "no arrow at all"],
      [4, "browser/terminal.ts", "main.ts", "arrows through others"],
      [3, "main.ts", "browser/navigation.ts", "an arrow"],
    ]);
  });

  it("marks the pairs no arrow joins, and says how many there are", () => {
    expect(figure).toContain('<tr class="hidden">');
    expect(figure).toContain("1 of them has no arrow between them, near or far");
  });
});
