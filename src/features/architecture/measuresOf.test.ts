import { describe, expect, it } from "vitest";
import { measuresOf } from "./measuresOf";
import type { Snapshot } from "./Snapshot";

const snapshot: Snapshot = {
  modules: [0, 1, 2].map((id) => ({ id, path: `p/q/${id}.ts`, lines: 1, test: false })),
  dependencies: [{ from: 0, to: 1, typeOnly: false }, { from: 2, to: 1, typeOnly: false }],
};

describe("the measures kept once worked out", () => {
  it("give the measure, and the very same answer when asked again", () => {
    expect(measuresOf.bridges(snapshot).get(1)).toBe(1);
    expect(measuresOf.reach(snapshot).get(1)).toBe(2);
    expect(measuresOf.bridges(snapshot)).toBe(measuresOf.bridges(snapshot));
    expect(measuresOf.groups(snapshot)).toBe(measuresOf.groups(snapshot));
  });
});
