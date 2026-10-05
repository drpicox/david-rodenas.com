import { describe, expect, it } from "vitest";
import type { Blueprint, PlacedNode, Wire } from "./Blueprint";
import { coreTypes } from "./coreTypes";
import { duplicated } from "./duplicated";
import { fits } from "./fits";
import { freshId } from "./freshId";
import { kitOf } from "./kitOf";
import { movedBy } from "./movedBy";
import type { NodeKind } from "./NodeKind";
import { wireRefused } from "./wireRefused";
import { withNode } from "./withNode";
import { withoutNodes } from "./withoutNodes";
import { withoutWires } from "./withoutWires";
import { withTitle } from "./withTitle";
import { withValue } from "./withValue";
import { withWire } from "./withWire";

const kind = (name: string, inputs: [string, string][], outputs: [string, string][]): NodeKind => ({
  name,
  title: name,
  role: "step",
  shelf: "Test",
  summary: "",
  inputs: inputs.map(([pin, type]) => ({ name: pin, label: pin, type })),
  outputs: outputs.map(([pin, type]) => ({ name: pin, label: pin, type })),
  run: () => ({}),
});
const kit = kitOf([kind("source", [], [["table", "table"]]), kind("count", [["table", "table"]], [["n", "number"]]), kind("half", [["value", "number"]], [["value", "number"]]), { ...kind("dial", [["value", "value"]], [["value", "value"]]), role: "dial" }], coreTypes);

const node = (id: string, kindName: string, x = 0, y = 0): PlacedNode => ({ id, kind: kindName, x, y, values: {} });
const wire = (from: string, out: string, to: string, into: string): Wire => ({ from: { node: from, pin: out }, to: { node: to, pin: into } });
const blueprint: Blueprint = {
  nodes: [node("s", "source", 0, 0), node("c", "count", 300, 0), node("h", "half", 600, 0)],
  wires: [wire("s", "table", "c", "table"), wire("c", "n", "h", "value")],
};

describe("a blueprint, changed one step at a time, each step a new blueprint", () => {
  it("adds a node under a name no other node has", () => {
    expect(freshId(blueprint, "count")).toBe("count");
    expect(freshId({ ...blueprint, nodes: [...blueprint.nodes, node("count", "count")] }, "count")).toBe("count-2");
    expect(withNode(blueprint, node("x", "half")).nodes.map((each) => each.id)).toEqual(["s", "c", "h", "x"]);
  });

  it("takes nodes away with every wire to and from them", () => {
    expect(withoutNodes(blueprint, ["c"])).toEqual({ nodes: [blueprint.nodes[0], blueprint.nodes[2]], wires: [] });
  });

  it("moves nodes, and only those", () => {
    expect(movedBy(blueprint, ["s", "h"], 10, -5).nodes.map((each) => [each.x, each.y])).toEqual([[10, -5], [300, 0], [610, -5]]);
  });

  it("wires an input, in the place of whatever was wired into it before, since an input takes one thing", () => {
    const rewired = withWire(blueprint, wire("s", "table", "c", "table"));
    expect(rewired.wires).toEqual(blueprint.wires);
    const twice = withWire(withNode(blueprint, node("t", "source")), wire("t", "table", "c", "table"));
    expect(twice.wires).toEqual([wire("t", "table", "c", "table"), wire("c", "n", "h", "value")]);
  });

  it("lets go of the wire into an input, or of every wire out of an output", () => {
    expect(withoutWires(blueprint, { node: "h", pin: "value" }, "input").wires).toEqual([wire("s", "table", "c", "table")]);
    expect(withoutWires(blueprint, { node: "s", pin: "table" }, "output").wires).toEqual([wire("c", "n", "h", "value")]);
  });

  it("writes a value on a node, and rubs it out, and renames it", () => {
    const written = withValue(blueprint, "h", "value", 4);
    expect(written.nodes[2]?.values).toEqual({ value: 4 });
    expect(withValue(written, "h", "value", undefined).nodes[2]?.values).toEqual({});
    expect(withTitle(blueprint, "c", "Rows").nodes[1]?.title).toBe("Rows");
    expect(withTitle(withTitle(blueprint, "c", "Rows"), "c", "").nodes[1]).toEqual(blueprint.nodes[1]);
  });

  it("copies nodes beside themselves, with the wires between them, under names of their own", () => {
    const { blueprint: copied, ids } = duplicated(blueprint, ["c", "h"], 30);
    expect(ids).toEqual(["count", "half"]);
    expect(copied.nodes.slice(3)).toEqual([node("count", "count", 330, 30), node("half", "half", 630, 30)]);
    expect(copied.wires.slice(2)).toEqual([wire("count", "n", "half", "value")]);
  });
});

describe("whether a wire can be drawn", () => {
  it("lets what flows go where its type fits: the same type, one it can become, or a dial into a number", () => {
    expect(fits(kit, "table", "table")).toBe(true);
    expect(fits(kit, "value", "number")).toBe(true);
    expect(fits(kit, "table", "number")).toBe(false);
  });

  it("says why not, in words: a type that does not fit, a node feeding itself, a circle", () => {
    expect(wireRefused(blueprint, kit, wire("s", "table", "h", "value"))).toBe("a table cannot go into value, which takes a number");
    expect(wireRefused(blueprint, kit, wire("h", "value", "h", "value"))).toBe("a node cannot feed itself");
    expect(wireRefused(blueprint, kit, wire("h", "value", "c", "table"))).toBe("a number cannot go into table, which takes a table");
    const looped = withNode(blueprint, node("h2", "half"));
    expect(wireRefused(withWire(looped, wire("h", "value", "h2", "value")), kit, wire("h2", "value", "h", "value"))).toBe("that would make a circle: h2 needs h already");
    expect(wireRefused(blueprint, kit, wire("s", "table", "c", "table"))).toBeNull();
    const dialled = withNode(blueprint, node("k", "dial"));
    expect(wireRefused(dialled, kit, wire("c", "n", "k", "value"))).toBe("a dial is turned by hand, and takes no wire");
  });
});
