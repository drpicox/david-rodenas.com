import { describe, expect, it } from "vitest";
import { decodeHistory } from "./decodeHistory";
import { encodeHistory } from "./encodeHistory";
import { standingsOf } from "./standingsOf";

// top needs mid, mid needs low; side stands alone.
const PATHS = ["top.ts", "mid.ts", "low.ts", "side.ts"];
const graph = { modules: PATHS.map((path) => ({ path, lines: 10, test: false, typesOnly: false })), dependencies: [{ from: "top.ts", to: "mid.ts", typeOnly: false }, { from: "mid.ts", to: "low.ts", typeOnly: false }] };
const commit = (sha: string, touched: string[]) => ({ commit: { sha, date: "2026-09-07", subject: sha }, graph, renamed: [], touched });
const history = encodeHistory([commit("written", []), commit("low", ["low.ts"]), commit("top", ["top.ts"])]);

describe("where each file stood at each commit", () => {
  it("says, for every file that ships, how far below it the nearest other change was, and whether it changed too", () => {
    expect(standingsOf(history, decodeHistory(history))).toEqual([
      { at: 1, id: 0, distance: 2, changed: false },
      { at: 1, id: 1, distance: 1, changed: false },
      { at: 1, id: 2, distance: null, changed: true },
      { at: 1, id: 3, distance: null, changed: false },
      { at: 2, id: 0, distance: null, changed: true },
      { at: 2, id: 1, distance: null, changed: false },
      { at: 2, id: 2, distance: null, changed: false },
      { at: 2, id: 3, distance: null, changed: false },
    ]);
  });
});
