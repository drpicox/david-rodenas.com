import { describe, expect, it } from "vitest";
import { changeFigures } from "./changeFigures";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";

const graph = (paths: string[]) => ({
  modules: paths.map((path) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: path.endsWith("Shape.ts") })),
  dependencies: paths.includes("features/f/f.ts") ? [{ from: "features/f/f.ts", to: "platform/p/draw.ts", typeOnly: false }, { from: "platform/p/draw.test.ts", to: "platform/p/draw.ts", typeOnly: false }] : [],
});
const step = (sha: string, date: string, paths: string[], touched: string[]) => ({ commit: { sha, date, subject: sha }, graph: graph(paths), renamed: [], touched });
const read = readHistory(
  JSON.stringify(
    encodeHistory([
      step("written", "2026-09-07T10:00:00+02:00", ["platform/p/draw.ts", "platform/p/draw.test.ts", "platform/p/Shape.ts"], []),
      step("a feature", "2026-09-08T10:00:00+02:00", ["platform/p/draw.ts", "platform/p/draw.test.ts", "platform/p/Shape.ts", "features/f/f.ts"], ["platform/p/draw.ts"]),
      step("changed together", "2026-09-09T10:00:00+02:00", ["platform/p/draw.ts", "platform/p/draw.test.ts", "platform/p/Shape.ts", "features/f/f.ts"], ["platform/p/draw.ts", "features/f/f.ts", "platform/p/draw.test.ts"]),
    ]),
  ),
);

describe("the figures of the page on how the source changes", () => {
  it("are drawn at every commit of the history, the first among them, with nothing left undrawn or uncounted", () => {
    for (const [name, figure] of Object.entries(changeFigures))
      for (const at of [0, 1, 2]) {
        const drawn = figure(read, at, null);
        expect(drawn, `${name} at ${at}`).toMatch(/^<figure/);
        expect(drawn, `${name} at ${at}`).not.toMatch(/NaN|undefined|Infinity/);
      }
  });

  it("are the source as it stood at the commit asked for", () => {
    expect(changeFigures["change-settling"]?.(read, 0, null)).toContain("2 of the 2 files that ship");
    expect(changeFigures["change-settling"]?.(read, 2, null)).toContain("of the 3 files that ship");
  });

  it("mark where the ratchet began, at the commit that brought it in", () => {
    const paths = ["platform/p/draw.ts", "platform/p/draw.test.ts", "platform/p/Shape.ts"];
    const ratcheted = readHistory(JSON.stringify(encodeHistory([step("written", "2026-09-07T10:00:00+02:00", paths, []), step("88300e5", "2026-09-29T11:00:00+02:00", paths, ["platform/p/draw.ts"])])));
    expect(changeFigures["ratchet"]?.(ratcheted, 1, null)).toContain("The ratchet holds them from 29 September 2026");
    expect(changeFigures["ratchet"]?.(ratcheted, 0, null)).toContain("The ratchet began on 29 September 2026, after this commit.");
  });

  it("put the lines the tests run in only at the commit they were counted at", () => {
    const coverage = { sha: "changed together", lines: { "platform/p/draw.ts": 100 } };
    expect(changeFigures["change-hotspots"]?.(read, 2, coverage)).toContain("<td>100%</td>");
    expect(changeFigures["change-hotspots"]?.(read, 1, coverage)).not.toContain("100%");
  });
});
