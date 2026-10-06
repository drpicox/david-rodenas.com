import { describe, expect, it } from "vitest";
import { NODE } from "./NODE";
import type { NodeKind } from "./NodeKind";
import { nodeShapeOf } from "./nodeShapeOf";

const join: NodeKind = {
  name: "join",
  title: "Join",
  role: "step",
  shelf: "Tables",
  summary: "",
  inputs: [
    { name: "left", label: "left", type: "table" },
    { name: "right", label: "right", type: "table" },
    { name: "on", label: "on", type: "text", editor: { kind: "text", lines: 3 } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: () => ({}),
};

describe("where a node's pins are", () => {
  const shape = nodeShapeOf(join);

  it("puts the outputs first, on the right, a row each, under the title", () => {
    expect(shape.outputs.get("table")).toEqual({ x: NODE.width, y: NODE.header + NODE.row / 2 });
  });

  it("puts the inputs after them, on the left, a row each, or as many rows as their editor asks", () => {
    expect(shape.inputs.get("left")).toEqual({ x: 0, y: NODE.header + NODE.row * 1.5 });
    expect(shape.inputs.get("right")).toEqual({ x: 0, y: NODE.header + NODE.row * 2.5 });
    expect(shape.inputs.get("on")).toEqual({ x: 0, y: NODE.header + NODE.row * 3.5 });
    expect(shape.height).toBe(NODE.header + NODE.row * 6 + NODE.foot);
  });

  it("draws a dial narrower, its value's pin at its own right edge", () => {
    const dial: NodeKind = { ...join, role: "dial", inputs: [{ name: "value", label: "value", type: "value" }], outputs: [{ name: "value", label: "value", type: "value" }] };
    expect(nodeShapeOf(dial)).toMatchObject({ width: NODE.dial, outputs: new Map([["value", { x: NODE.dial, y: NODE.header + NODE.row / 2 }]]) });
  });

  it("gives a node of a kind there is none of a title and a foot, and no pins", () => {
    expect(nodeShapeOf(undefined)).toEqual({ width: NODE.width, height: NODE.header + NODE.foot, inputs: new Map(), outputs: new Map(), rows: new Map() });
  });
});
