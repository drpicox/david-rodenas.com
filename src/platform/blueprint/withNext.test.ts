import { describe, expect, it } from "vitest";
import type { Blueprint } from "./Blueprint";
import { withNext } from "./withNext";

const blueprint: Blueprint = {
  nodes: [
    { id: "heat", kind: "nights", x: 0, y: 0, values: {} },
    { id: "air", kind: "nights", x: 0, y: 200, values: {} },
    { id: "keep", kind: "keep", x: 300, y: 0, values: {} },
  ],
  wires: [{ from: { node: "heat", pin: "table" }, to: { node: "keep", pin: "table" } }],
};

describe("a next step taken", () => {
  it("adds its node where asked, under a name no other has, written as offered and wired from the node it follows", () => {
    const { blueprint: next, added } = withNext(blueprint, "heat", { label: "Only what was measured whole", kind: "keep", from: "table", into: "table", values: { column: "whole", is: "equals", value: "yes" } }, { x: 300, y: 120 });
    expect(added).toBe("keep-2");
    expect(next.nodes.at(-1)).toEqual({ id: "keep-2", kind: "keep", x: 300, y: 120, values: { column: "whole", is: "equals", value: "yes" } });
    expect(next.wires.at(-1)).toEqual({ from: { node: "heat", pin: "table" }, to: { node: "keep-2", pin: "table" } });
    expect(blueprint.nodes.length).toBe(3);
  });

  it("wires what a join joins with into it too", () => {
    const { blueprint: next, added } = withNext(blueprint, "heat", { label: "Join with Nights", kind: "join", from: "table", into: "left", values: {}, also: { from: { node: "air", pin: "table" }, into: "right" } }, { x: 0, y: 0 });
    expect(next.wires.filter((wire) => wire.to.node === added)).toEqual([
      { from: { node: "heat", pin: "table" }, to: { node: "join", pin: "left" } },
      { from: { node: "air", pin: "table" }, to: { node: "join", pin: "right" } },
    ]);
  });
});
