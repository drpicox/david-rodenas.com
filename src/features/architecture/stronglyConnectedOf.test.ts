import { describe, expect, it } from "vitest";
import { stronglyConnectedOf } from "./stronglyConnectedOf";

describe("the parts of a graph that reach each other round in a circle", () => {
  it("finds every set of nodes each of which reaches all the others, one node alone being a set of its own", () => {
    // a → b → c → a is a circle; c → d, and d stands alone.
    const next = new Map([["a", ["b"]], ["b", ["c"]], ["c", ["a", "d"]], ["d", []]]);
    const parts = stronglyConnectedOf(["a", "b", "c", "d"], (node) => next.get(node) ?? []);
    expect(parts.map((part) => [...part].sort())).toEqual([["d"], ["a", "b", "c"]]);
  });
});
