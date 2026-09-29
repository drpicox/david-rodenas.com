import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";
import { renderArchitectureFigure } from "./renderArchitectureFigure";

const graph = (paths: string[]) => ({ modules: paths.map((path) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false })), dependencies: [] });
const history = readHistory(JSON.stringify(encodeHistory([
  { commit: { sha: "aaaaaaa", date: "2026-09-07T10:00:00+02:00", subject: "The first page" }, graph: graph(["core/a.ts"]), renamed: [], touched: [] },
  { commit: { sha: "bbbbbbb", date: "2026-09-08T11:00:00+02:00", subject: "The folders say what the site is" }, graph: graph(["platform/a.ts", "features/b/b.ts", "features/b/b.test.ts"]), renamed: [["core/a.ts", "platform/a.ts"]], touched: ["platform/a.ts"] },
])));

describe("the figure of the architecture at one commit", () => {
  it("is the picture, with the commit it shows under it: which, when, and what it said", () => {
    const figure = renderArchitectureFigure(history, 1);
    expect(figure).toContain('<svg class="architecture"');
    expect(figure).toContain("<code>bbbbbbb</code>");
    expect(figure).toContain("8 September 2026");
    expect(figure).toContain("The folders say what the site is");
  });

  it("says what it measures at that commit", () => {
    expect(renderArchitectureFigure(history, 1)).toContain("2 files in 2 boxes, 1 test");
    expect(renderArchitectureFigure(history, 0)).toContain("1 file in 1 box, 0 tests");
  });

  it("stands the network beside the picture, where a click will put the details of what it chose", () => {
    const figure = renderArchitectureFigure(history, 1);
    expect(figure).toMatch(/<aside class="architecture-details"[^>]*><h3>The network<\/h3>/);
  });
});
