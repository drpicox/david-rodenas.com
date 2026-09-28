import { describe, expect, it } from "vitest";
import { cascadeOf } from "./cascadeOf";
import { decodeHistory } from "./decodeHistory";
import { encodeHistory } from "./encodeHistory";

// top needs mid, mid needs low; side stands alone; and mid has a test.
const PATHS = ["top.ts", "mid.ts", "low.ts", "side.ts", "mid.test.ts"];
const ARROWS = [["top.ts", "mid.ts"], ["mid.ts", "low.ts"], ["mid.test.ts", "mid.ts"]];
const graph = { modules: PATHS.map((path) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false })), dependencies: ARROWS.map(([from = "", to = ""]) => ({ from, to, typeOnly: false })) };
const commit = (sha: string, touched: string[]) => ({ commit: { sha, date: "2026-09-07", subject: sha }, graph, renamed: [], touched });
const history = encodeHistory([commit("written", []), commit("low and mid", ["low.ts", "mid.ts", "mid.test.ts"]), commit("low", ["low.ts"]), commit("top and side", ["top.ts", "side.ts"])]);
const snapshots = decodeHistory(history);

describe("how far a change travels, against the arrows", () => {
  it("counts every file at every commit by how far below it the nearest other change was, and whether it changed too", () => {
    expect(cascadeOf(history, snapshots)).toEqual([
      // mid, when low changed under it (and it changed); top, over mid (and did not); mid again, when only low did.
      { distance: 1, seen: 3, changed: 1 },
      // top, when only low changed, two arrows down.
      { distance: 2, seen: 1, changed: 0 },
      // Everything with nothing changed below it: low and side twice, and all four at the last commit.
      { distance: null, seen: 8, changed: 4 },
    ]);
  });

  it("leaves out a sweep, a commit that changed more files than the limit", () => {
    expect(cascadeOf(history, snapshots, 2)).toEqual([
      { distance: 1, seen: 1, changed: 0 },
      { distance: 2, seen: 1, changed: 0 },
      { distance: null, seen: 6, changed: 3 },
    ]);
  });
});
