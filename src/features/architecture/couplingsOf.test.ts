import { describe, expect, it } from "vitest";
import { couplingsOf } from "./couplingsOf";
import type { Change, History } from "./History";

const commit = (sha: string) => ({ sha, date: "2026-09-07", subject: sha });
const change = (changed: number[], added: Change["added"] = []): Change => ({ added, removed: [], moved: [], resized: [], changed, linked: [], unlinked: [] });

// Three files written together; then a and b changed together, all three, a and c, and b alone.
const history: History = {
  commits: ["written", "a b", "a b c", "a c", "b"].map(commit),
  changes: [change([], [[0, "a.ts", 1, false], [1, "b.ts", 1, false], [2, "c.ts", 1, false]]), change([0, 1]), change([0, 1, 2]), change([0, 2]), change([1])],
};

describe("what changes together", () => {
  it("counts, for every two files, the commits that changed both, the most first, and leaves out what happened once", () => {
    expect(couplingsOf(history)).toEqual([
      { a: 0, b: 1, together: 2 },
      { a: 0, b: 2, together: 2 },
    ]);
  });

  it("does not count being written together as changing together", () => {
    expect(couplingsOf(history, 30, 1).find(({ a, b }) => a === 1 && b === 2)?.together).toBe(1);
  });

  it("leaves out a sweep", () => {
    expect(couplingsOf(history, 2, 1)).toEqual([
      { a: 0, b: 1, together: 1 },
      { a: 0, b: 2, together: 1 },
    ]);
  });
});
