import { describe, expect, it } from "vitest";
import type { Blueprint, PlacedNode, Wire } from "./Blueprint";
import { coreTypes } from "./coreTypes";
import { kitOf } from "./kitOf";
import { NODE } from "./NODE";
import type { NodeKind } from "./NodeKind";
import { nodeShapeOf } from "./nodeShapeOf";
import { tidyBlueprint } from "./tidyBlueprint";

const kind = (name: string, inputs: string[], outputs: string[]): NodeKind => ({
  name,
  title: name,
  role: "step",
  shelf: "Test",
  summary: "",
  inputs: inputs.map((input) => ({ name: input, label: input, type: "table" })),
  outputs: outputs.map((output) => ({ name: output, label: output, type: "table" })),
  run: () => ({}),
});

const kit = kitOf([kind("source", [], ["table"]), kind("step", ["table", "other"], ["table"]), kind("join", ["left", "right"], ["table"]), kind("paint", ["table"], [])], coreTypes);
const node = (id: string, kindName: string): PlacedNode => ({ id, kind: kindName, x: 0, y: 0, values: {} });
const wire = (from: string, to: string, pin = "table"): Wire => ({ from: { node: from, pin: "table" }, to: { node: to, pin } });
const at = (blueprint: Blueprint, id: string) => blueprint.nodes.find((each) => each.id === id)!;
/** Where a pin of a placed node is on the canvas. */
const pin = (blueprint: Blueprint, id: string, name: string, side: "inputs" | "outputs") => {
  const placed = at(blueprint, id);
  const point = nodeShapeOf(kit.kinds.get(placed.kind))[side].get(name)!;
  return { x: placed.x + point.x, y: placed.y + point.y };
};

describe("a blueprint tidied, for one written without saying where its nodes stand", () => {
  it("stands each node a column to the right of what it needs, its wire level where it can be", () => {
    const tidy = tidyBlueprint({ nodes: [node("paint", "paint"), node("step", "step"), node("source", "source")], wires: [wire("source", "step"), wire("step", "paint")] }, kit);
    expect([at(tidy, "source").x, at(tidy, "step").x, at(tidy, "paint").x]).toEqual([0, 1, 2].map((column) => 40 + column * (NODE.width + 80)));
    expect(pin(tidy, "step", "table", "inputs").y).toBe(pin(tidy, "source", "table", "outputs").y);
    expect(pin(tidy, "paint", "table", "inputs").y).toBe(pin(tidy, "step", "table", "outputs").y);
  });

  it("stacks the nodes of one column without letting them overlap, and stands a join between what it joins", () => {
    const tidy = tidyBlueprint({ nodes: [node("a", "source"), node("b", "source"), node("both", "join")], wires: [wire("a", "both", "left"), wire("b", "both", "right")] }, kit);
    const [a, b, both] = ["a", "b", "both"].map((id) => at(tidy, id));
    expect(b!.y).toBeGreaterThanOrEqual(a!.y + nodeShapeOf(kit.kinds.get("source")).height + 20);
    expect(both!.y).toBeGreaterThan(a!.y);
    expect(both!.y).toBeLessThan(b!.y);
  });

  it("stands what feeds a later node in the column just before it, not far away at the start", () => {
    const tidy = tidyBlueprint({ nodes: [node("a", "source"), node("step", "step"), node("late", "source"), node("next", "step")], wires: [wire("a", "step"), wire("step", "next"), wire("late", "next", "other")] }, kit);
    expect(at(tidy, "late").x).toBe(at(tidy, "step").x);
  });

  it("starts at the top left corner, however the nodes fell", () => {
    const tidy = tidyBlueprint({ nodes: [node("a", "source"), node("step", "step")], wires: [wire("a", "step")] }, kit);
    expect(Math.min(...tidy.nodes.map((each) => each.y))).toBe(40);
    expect(Math.min(...tidy.nodes.map((each) => each.x))).toBe(40);
  });
});
