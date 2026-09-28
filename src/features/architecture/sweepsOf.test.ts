import { describe, expect, it } from "vitest";
import type { Change } from "./History";
import { sweepsOf } from "./sweepsOf";

const changed = (count: number): Change => ({ added: [], removed: [], moved: [], resized: [], retyped: [], changed: Array.from({ length: count }, (_, id) => id), linked: [], unlinked: [] });

describe("the sweeps of a history", () => {
  it("are the commits that changed more files than the limit, by their place in it", () => {
    expect(sweepsOf({ commits: [], changes: [changed(3), changed(31), changed(30), changed(72)] })).toEqual(new Set([1, 3]));
    expect(sweepsOf({ commits: [], changes: [changed(3), changed(4)] }, 3)).toEqual(new Set([1]));
  });
});
