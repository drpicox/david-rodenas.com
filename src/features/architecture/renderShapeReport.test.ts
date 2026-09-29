import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";
import { renderShapeReport } from "./renderShapeReport";

const file = (path: string) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false });
const needs = (from: string, to: string) => ({ from, to, typeOnly: false });
const commit = (sha: string, day: number) => ({ sha, date: `2026-09-0${day}T10:00:00+02:00`, subject: sha });
const read = readHistory(
  JSON.stringify(
    encodeHistory([
      { commit: commit("aaaaaaa", 1), graph: { modules: [file("platform/a/a.ts"), file("features/f/f.ts")], dependencies: [needs("features/f/f.ts", "platform/a/a.ts")] }, renamed: [], touched: [] },
      // A new file, needing a.ts, and with no test.
      { commit: commit("bbbbbbb", 2), graph: { modules: [file("platform/a/a.ts"), file("features/f/f.ts"), file("features/g/g.ts")], dependencies: [needs("features/f/f.ts", "platform/a/a.ts"), needs("features/g/g.ts", "platform/a/a.ts")] }, renamed: [], touched: [] },
    ]),
  ),
);

describe("the report of how the shape of the source moved", () => {
  const report = renderShapeReport(read, 0, 1);

  it("says which two commits it sets side by side", () => {
    expect(report).toContain("from `aaaaaaa` to `bbbbbbb`");
  });

  it("gives every measure before and after, and how far it moved", () => {
    expect(report).toContain("| files that ship | 2 | 3 | +1 |");
    expect(report).toContain("| arrows | 1 | 2 | +1 |");
    expect(report).toContain("| tallest stack | 1 | 1 | 0 |");
  });

  it("says, of what the ratchet holds, whether it went the ratchet's way or against it", () => {
    expect(report).toContain("| files with something to run that no test imports | 2 | 3 | +1, worse |");
    expect(renderShapeReport(read, 1, 0)).toContain("| files with something to run that no test imports | 3 | 2 | −1, better |");
  });
});
