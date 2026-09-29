import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { fileHistoryOf } from "./fileHistoryOf";
import { readHistory } from "./readHistory";

const PATHS = ["platform/p/low.ts", "platform/p/mid.ts", "features/f/top.ts", ...[0, 1, 2, 3, 4, 5].map((n) => `features/h/idle${n}.ts`)];
const graph = {
  modules: PATHS.map((path) => ({ path, lines: 10, test: false, typesOnly: false })),
  dependencies: [
    { from: "platform/p/mid.ts", to: "platform/p/low.ts", typeOnly: false },
    { from: "features/f/top.ts", to: "platform/p/mid.ts", typeOnly: false },
  ],
};
const step = (sha: string, day: number, touched: string[]) => ({ commit: { sha, date: `2026-09-0${day}T10:00:00+02:00`, subject: sha }, graph, renamed: [], touched });
const read = readHistory(JSON.stringify(encodeHistory([step("written", 1, []), step("low and mid", 2, ["platform/p/low.ts", "platform/p/mid.ts"]), step("top", 3, ["features/f/top.ts"]), step("low and mid again", 4, ["platform/p/low.ts", "platform/p/mid.ts"])])));

describe("a file's history, as its details show it", () => {
  const mid = fileHistoryOf(read, 3, 1);

  it("says the commit that wrote it, and every commit that changed it up to the one shown", () => {
    expect(mid.born.commit.sha).toBe("written");
    expect(mid.changes.map(({ commit }) => commit.sha)).toEqual(["low and mid", "low and mid again"]);
    expect(fileHistoryOf(read, 2, 1).changes).toHaveLength(1);
  });

  it("says how hot it is, and what its ground would lead one to expect beside what it did", () => {
    expect(mid.heat).toBe(1);
    expect(mid.ground?.actual).toBe(2);
    expect(mid.ground?.expected).toBeGreaterThan(0);
  });

  it("names the files it changed together with most, and what joins them", () => {
    expect(mid.partners).toEqual([{ id: 0, path: "platform/p/low.ts", together: 2, joined: "arrow" }]);
  });
});
