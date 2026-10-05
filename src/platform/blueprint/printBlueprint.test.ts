import { describe, expect, it } from "vitest";
import type { Blueprint } from "./Blueprint";
import { coreTypes } from "./coreTypes";
import { kitOf } from "./kitOf";
import type { NodeKind } from "./NodeKind";
import { parseBlueprint } from "./parseBlueprint";
import { printBlueprint } from "./printBlueprint";

const kind = (name: string, inputs: NodeKind["inputs"], outputs: NodeKind["outputs"]): NodeKind => ({ name, title: name, role: "step", shelf: "Test", summary: "", inputs, outputs, run: () => ({}) });

const kit = kitOf(
  [
    kind("weather-months", [{ name: "station", label: "station", type: "text" }], [{ name: "table", label: "table", type: "table" }]),
    kind("join", [{ name: "left", label: "left", type: "table" }, { name: "right", label: "right", type: "table" }, { name: "on", label: "on", type: "text", optional: true }], [{ name: "table", label: "table", type: "table" }]),
    kind("trend", [{ name: "table", label: "table", type: "table" }], [{ name: "slope", label: "slope", type: "number" }, { name: "per-ten", label: "per ten", type: "number" }]),
    kind("readout", [{ name: "value", label: "value", type: "number" }, { name: "faded", label: "faded", type: "flag", optional: true }], []),
    kind("dial", [{ name: "value", label: "value", type: "value" }], [{ name: "value", label: "value", type: "value" }]),
  ],
  coreTypes,
);

const blueprint: Blueprint = {
  nodes: [
    { id: "where", kind: "dial", x: 0, y: 0, title: "Station", values: { value: "08019058" } },
    { id: "heat", kind: "weather-months", x: 40.4, y: 80, values: {} },
    { id: "both", kind: "join", x: 300, y: 80, values: { on: "year month" } },
    { id: "fit", kind: "trend", x: 560, y: 80, title: 'The "trend"\nof it', values: {} },
    { id: "readout", kind: "readout", x: 800, y: 80, values: { faded: true } },
  ],
  wires: [
    { from: { node: "where", pin: "value" }, to: { node: "heat", pin: "station" } },
    { from: { node: "heat", pin: "table" }, to: { node: "both", pin: "left" } },
    { from: { node: "heat", pin: "table" }, to: { node: "both", pin: "right" } },
    { from: { node: "both", pin: "table" }, to: { node: "fit", pin: "table" } },
    { from: { node: "fit", pin: "per-ten" }, to: { node: "readout", pin: "value" } },
  ],
};

describe("a blueprint written as text", () => {
  it("writes one node a line, named only where a wire needs the name, its inputs in the order its kind has them", () => {
    expect(printBlueprint(blueprint, kit).split("\n")).toEqual([
      'where = dial "Station" value: "08019058" @ 0 0',
      "heat = weather-months station: where @ 40 80",
      'both = join left: heat right: heat on: "year month" @ 300 80',
      'fit = trend "The \\"trend\\"\\nof it" table: both @ 560 80',
      "readout value: fit.per-ten faded: yes @ 800 80",
    ]);
  });

  it("leaves out where nodes stand, when asked, for text a person writes", () => {
    expect(printBlueprint(blueprint, kit, { positions: false }).split("\n")[1]).toBe("heat = weather-months station: where");
  });

  it("reads back as the blueprint it was written from", () => {
    const read = parseBlueprint(printBlueprint(blueprint, kit), kit);
    expect(read.problems).toEqual([]);
    expect(read.blueprint).toEqual({ ...blueprint, nodes: blueprint.nodes.map((node) => ({ ...node, x: Math.round(node.x) })) });
  });

  it("quotes a word that would otherwise be read as a wire, or as something else", () => {
    const named: Blueprint = { nodes: [{ id: "heat", kind: "weather-months", x: 0, y: 0, values: { station: "both" } }, { id: "both", kind: "join", x: 0, y: 0, values: { on: "a:b" } }], wires: [] };
    expect(printBlueprint(named, kit, { positions: false })).toBe('weather-months station: "both"\njoin on: "a:b"');
  });

  it("writes a node of a kind there is none of as it was read", () => {
    const strange: Blueprint = { nodes: [{ id: "teleport", kind: "teleport", x: 0, y: 0, values: { to: "mars" } }], wires: [] };
    expect(printBlueprint(strange, kit, { positions: false })).toBe("teleport to: mars");
  });
});
