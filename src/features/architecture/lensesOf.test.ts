import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { lensesOf, type LensChoice } from "./lensesOf";
import { readHistory } from "./readHistory";

// A frame box of two files, a feature standing on it, another feature on its own, and six files that never change, as most never do.
const PATHS = ["platform/p/low.ts", "platform/p/mid.ts", "features/f/top.ts", "features/g/side.ts", ...[0, 1, 2, 3, 4, 5].map((n) => `features/h/idle${n}.ts`)];
const graph = {
  modules: PATHS.map((path) => ({ path, lines: 10, test: false, typesOnly: false })),
  dependencies: [
    { from: "platform/p/mid.ts", to: "platform/p/low.ts", typeOnly: false },
    { from: "features/f/top.ts", to: "platform/p/mid.ts", typeOnly: false },
  ],
};
const commit = (sha: string, touched: string[]) => ({ commit: { sha, date: "2026-09-07", subject: sha }, graph, renamed: [], touched });
const read = readHistory(
  JSON.stringify(
    encodeHistory([
      commit("written", []),
      commit("low and mid", ["platform/p/low.ts", "platform/p/mid.ts"]),
      commit("low", ["platform/p/low.ts"]),
      commit("top and side", ["features/f/top.ts", "features/g/side.ts"]),
      commit("low and mid again", ["platform/p/low.ts", "platform/p/mid.ts"]),
    ]),
  ),
);
const LAST = 4;
const choice = (parts: Partial<LensChoice>): LensChoice => ({ sizing: "lines", colour: "plain", together: false, pointing: "1", ...parts });

describe("the lenses the picture of the source is seen through", () => {
  it("sizes a ball by what it is asked to, and leaves it to its lines otherwise", () => {
    expect(lensesOf(read, LAST, choice({})).sizes).toBeNull();
    const reach = lensesOf(read, LAST, choice({ sizing: "reachedBy" })).sizes;
    // A change to low could reach mid and top; to side, nothing.
    expect(reach?.get(0)).toBeGreaterThan(reach?.get(3) ?? Infinity);
    const changes = lensesOf(read, 2, choice({ sizing: "changes" })).sizes;
    expect(changes?.get(0)).toBeGreaterThan(changes?.get(1) ?? Infinity);
  });

  it("colours a file by its heat: whole where the commit shown changed it, cooler the longer ago, cold if never", () => {
    const { tones, ramp } = lensesOf(read, 3, choice({ colour: "heat" }));
    expect(ramp).toBe("warm");
    expect(tones?.get(2)).toBe(1);
    // mid changed two commits before: warm, not whole.
    expect(tones?.get(1) ?? 0).toBeLessThan(1);
    expect(tones?.get(1) ?? 0).toBeGreaterThan(0.5);
    expect(tones?.get(4)).toBe(0);
  });

  it("colours a file by what its ground would lead one to expect: the most exposed whole, one standing on nothing that moved at the share any file changes, and only the files there are", () => {
    const { tones } = lensesOf(read, LAST, choice({ colour: "exposure" }));
    expect(Math.max(...(tones?.values() ?? []))).toBe(1);
    // mid stood one arrow over every change to low; side, over nothing.
    expect(tones?.get(3) ?? 1).toBeLessThan(tones?.get(1) ?? 0);
    expect([...(tones?.keys() ?? [])].every((id) => read.snapshots[LAST]?.modules.some((module) => module.id === id))).toBe(true);
  });

  it("colours a file by how stable its box is, and marks the box arrows that go against stability", () => {
    const { tones, ramp, against } = lensesOf(read, LAST, choice({ colour: "stability" }));
    expect(ramp).toBe("cool");
    // The frame box is needed and needs nothing: as stable as it gets.
    expect(tones?.get(0)).toBe(1);
    expect(against).toEqual(new Set());
  });

  it("draws the threads of what changed together only when asked", () => {
    expect(lensesOf(read, LAST, choice({})).threads).toEqual([]);
    expect(lensesOf(read, LAST, choice({ together: true })).threads).toEqual([{ a: 0, b: 1, together: 2, joined: "arrow" }]);
  });

  it("gives each file its group only when pointing at one shows its group", () => {
    expect(lensesOf(read, LAST, choice({})).groups).toBeNull();
    const groups = lensesOf(read, LAST, choice({ pointing: "group" })).groups;
    expect(groups?.get(0)).toBe(groups?.get(1));
  });

  it("says in words what each lens shows", () => {
    const { said } = lensesOf(read, LAST, choice({ sizing: "bridges", colour: "exposure", together: true, pointing: "together" }));
    expect(said).toContain("as big as it stands between the others");
    expect(said).toContain("warm as often as files that stood where it stood changed");
    expect(said).toContain("dashed where no arrow joins them");
    expect(said).toContain("point at a file for what changed with it");
  });
});
