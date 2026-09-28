import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import { renderHotspotsFigure } from "./renderHotspotsFigure";

const life = (id: number, path: string, lines: number, born: number, changed: number[], went?: number): Life => ({ id, path, lines, test: path.endsWith(".test.ts"), typesOnly: false, born, changed, ...(went === undefined ? {} : { went }) });
const lives = [
  life(0, "platform/page/renderDocument.ts", 150, 0, [1, 2, 3, 9]),
  life(1, "main.ts", 90, 0, [4, 8]),
  life(2, "features/f/f.ts", 30, 2, [3, 5]),
  life(3, "platform/page/renderDocument.test.ts", 200, 0, [1, 2, 3, 4, 5, 9]),
  life(4, "core/gone.ts", 10, 0, [1, 2, 3, 4, 5], 6),
  life(5, "features/f/quiet.ts", 12, 1, []),
];
const coverage = { sha: "abc", lines: { "platform/page/renderDocument.ts": 100, "main.ts": 0, "features/f/f.ts": 62.5 } };

describe("the figure of the files that change most", () => {
  const figure = renderHotspotsFigure(lives, 10, coverage, 3);
  const rows = [...figure.matchAll(/<tr><td><code>(.*?)<\/code><\/td><td>(\d+)<\/td><td>(\d+)<\/td><td>([^<]+)<\/td>/g)].map(([, path = "", changes, lines, tested]) => [path.replaceAll("<wbr>", ""), Number(changes), Number(lines), tested]);

  it("lists the files that ship, the most changed first, with their changes, their lines, and how much of them the tests run", () => {
    expect(rows).toEqual([
      ["platform/page/renderDocument.ts", 4, 150, "100%"],
      ["main.ts", 2, 90, "0%"],
      ["features/f/f.ts", 2, 30, "63%"],
    ]);
  });

  it("draws each one's life on the same line of commits: where it was written, and a mark for every commit that changed it", () => {
    expect(figure.match(/<svg class="life"/g)).toHaveLength(3);
    expect(figure.match(/<line class="change"/g)).toHaveLength(8);
    expect(figure.match(/<circle class="written"/g)).toHaveLength(3);
  });

  it("says how many of them no test runs a line of", () => {
    expect(figure).toContain("1 of them has no line a test runs");
  });

  it("says nothing of the tests when they were not counted", () => {
    const uncounted = renderHotspotsFigure(lives, 10, null, 3);
    expect(uncounted).toContain("<td>–</td>");
    expect(uncounted).not.toContain("no line a test runs");
  });
});
