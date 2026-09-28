import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";
import { renderChangeMatrixFigure } from "./renderChangeMatrixFigure";

const graph = (paths: string[]) => ({ modules: paths.map((path) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false })), dependencies: [{ from: "main.ts", to: "platform/p/a.ts", typeOnly: false }] });
const commit = (sha: string, date: string, touched: string[]) => ({ commit: { sha, date, subject: sha }, graph: graph(["main.ts", "platform/p/a.ts", "platform/p/a.test.ts"]), renamed: [], touched });
const read = readHistory(JSON.stringify(encodeHistory([commit("one", "2026-09-07T10:00:00+02:00", []), commit("two", "2026-09-08T10:00:00+02:00", ["platform/p/a.ts", "platform/p/a.test.ts"]), commit("three", "2026-09-09T10:00:00+02:00", ["platform/p/a.ts", "main.ts"])])));

describe("the figure of where the changes went", () => {
  const figure = renderChangeMatrixFigure(read);

  it("is the picture, with a key to its marks", () => {
    expect(figure).toContain('<svg class="change-matrix"');
    expect(figure).toMatch(/class="changes-legend"[\s\S]*a file written/);
  });

  it("says how many commits it spans, and how many changes and new files it counts, the tests left out", () => {
    expect(figure).toContain("3 commits, from 7 to 9 September 2026");
    expect(figure).toContain("3 changes to files that ship");
    expect(figure).toContain("and 2 files written");
  });

  it("at an earlier commit, counts only up to it, and says how far into the history it is", () => {
    const earlier = renderChangeMatrixFigure(read, 1);
    expect(earlier).toContain("2 of 3 commits, from 7 to 8 September 2026: 1 change to files that ship, and 2 files written.");
    expect(earlier).toContain('class="future"');
  });
});
