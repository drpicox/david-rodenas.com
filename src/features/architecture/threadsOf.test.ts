import { describe, expect, it } from "vitest";
import type { Change, History } from "./History";
import type { Snapshot } from "./Snapshot";
import { threadsOf } from "./threadsOf";

const change = (changed: number[]): Change => ({ added: [], removed: [], moved: [], resized: [], retyped: [], changed, linked: [], unlinked: [] });
const history: History = { commits: [], changes: [change([]), change([0, 1]), change([0, 1, 2]), change([2, 3]), change([2, 3]), change([0, 9]), change([0, 9])] };
// 0 needs 1; 2 and 3 are joined by nothing; 9 is a test.
const snapshot: Snapshot = {
  modules: [0, 1, 2, 3, 9].map((id) => ({ id, path: `${id}.ts`, lines: 1, test: id === 9 })),
  dependencies: [{ from: 0, to: 1, typeOnly: false }],
};

describe("the threads of what changed together, to draw on the picture", () => {
  it("joins every two files that ship that changed together twice or more, saying how often and what else joins them", () => {
    expect(threadsOf(history, snapshot)).toEqual([
      { a: 0, b: 1, together: 2, joined: "arrow" },
      { a: 2, b: 3, together: 2, joined: "none" },
    ]);
  });
});
