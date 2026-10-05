import { describe, expect, it } from "vitest";
import { coreTypes } from "./coreTypes";
import { kitOf } from "./kitOf";
import type { NodeKind } from "./NodeKind";
import { parseBlueprint } from "./parseBlueprint";

const kind = (name: string, inputs: NodeKind["inputs"], outputs: NodeKind["outputs"]): NodeKind => ({ name, title: name, role: "step", shelf: "Test", summary: "", inputs, outputs, run: () => ({}) });

const kit = kitOf(
  [
    kind("weather-months", [{ name: "station", label: "station", type: "text", initial: "WU" }], [{ name: "table", label: "table", type: "table" }]),
    kind("no2-months", [{ name: "station", label: "station", type: "text" }, { name: "weekends", label: "weekends", type: "flag", initial: false }], [{ name: "table", label: "table", type: "table" }]),
    kind("join", [{ name: "left", label: "left", type: "table" }, { name: "right", label: "right", type: "table" }, { name: "on", label: "on", type: "text", optional: true }], [{ name: "table", label: "table", type: "table" }]),
    kind("trend", [{ name: "table", label: "table", type: "table" }, { name: "x", label: "x", type: "text" }], [{ name: "slope", label: "slope", type: "number" }, { name: "per-ten", label: "per ten", type: "number" }]),
    kind("readout", [{ name: "value", label: "value", type: "number" }, { name: "digits", label: "digits", type: "number", initial: 2 }], []),
    kind("dial", [{ name: "value", label: "value", type: "value" }], [{ name: "value", label: "value", type: "value" }]),
  ],
  coreTypes,
);

describe("a blueprint read from its text", () => {
  it("makes a node of each line, named, of a kind, with what is written on it", () => {
    const { blueprint, problems } = parseBlueprint('heat = weather-months "Heat at the Fabra" station: D5', kit);
    expect(problems).toEqual([]);
    expect(blueprint.nodes).toEqual([{ id: "heat", kind: "weather-months", x: 0, y: 0, title: "Heat at the Fabra", values: { station: "D5" } }]);
  });

  it("wires an input to the node a value names, to its first output or to the one named after a dot", () => {
    const { blueprint } = parseBlueprint(["heat = weather-months", "air = no2-months station: 08019058", "both = join left: heat right: air", "fit = trend table: both x: tx", "readout value: fit.per-ten"].join("\n"), kit);
    expect(blueprint.wires).toEqual([
      { from: { node: "heat", pin: "table" }, to: { node: "both", pin: "left" } },
      { from: { node: "air", pin: "table" }, to: { node: "both", pin: "right" } },
      { from: { node: "both", pin: "table" }, to: { node: "fit", pin: "table" } },
      { from: { node: "fit", pin: "per-ten" }, to: { node: "readout", pin: "value" } },
    ]);
  });

  it("names a node it was not told to name after its kind, apart from every other name", () => {
    const { blueprint } = parseBlueprint(["readout value: 1", "readout = weather-months", "readout value: 2"].join("\n"), kit);
    expect(blueprint.nodes.map((node) => node.id)).toEqual(["readout-2", "readout", "readout-3"]);
  });

  it("reads each value as its input takes it: words stay words, even when they look like a number", () => {
    const { blueprint } = parseBlueprint('no2-months station: 08019058 weekends: yes\nreadout value: -2.5 digits: 1\njoin on: "year month"', kit);
    expect(blueprint.nodes.map((node) => node.values)).toEqual([{ station: "08019058", weekends: true }, { value: -2.5, digits: 1 }, { on: "year month" }]);
  });

  it("reads a dial's value as whatever it is wired into takes it", () => {
    const { blueprint } = parseBlueprint(["where = dial value: 08019058", "level = dial value: 25", "no2-months station: where", "readout value: level"].join("\n"), kit);
    expect(blueprint.nodes.slice(0, 2).map((node) => node.values["value"])).toEqual(["08019058", 25]);
  });

  it("puts a node where its line says, and says whether every node was put", () => {
    expect(parseBlueprint("weather-months @ 40 -20", kit)).toMatchObject({ blueprint: { nodes: [{ x: 40, y: -20 }] }, placed: true });
    expect(parseBlueprint("weather-months @ 40 -20\nreadout value: 1", kit).placed).toBe(false);
  });

  it("reads past comments and blank lines, and keeps the escapes of a quoted value", () => {
    const { blueprint } = parseBlueprint('# the heat\n\nweather-months "a \\"warm\\" one\\nsecond line" # here', kit);
    expect(blueprint.nodes[0]?.title).toBe('a "warm" one\nsecond line');
  });

  it("says what it could not read, by line, and reads the rest", () => {
    const { blueprint, problems } = parseBlueprint(["weather-months stattion: D5", "readout value: lots", "= join", "a = weather-months", "a = weather-months"].join("\n"), kit);
    expect(problems).toEqual([
      { line: 1, message: "weather-months takes no stattion" },
      { line: 2, message: "value takes a number, not lots" },
      { line: 3, message: "a line names a kind of node, as in: heat = weather-months station: D5" },
      { line: 5, message: "a is the name of another node already" },
    ]);
    expect(blueprint.nodes.map((node) => node.id)).toEqual(["weather-months", "readout", "a"]);
  });

  it("says so when what an input takes can only come along a wire, and the value names no node", () => {
    const { blueprint, problems } = parseBlueprint("join left: heat", kit);
    expect(problems).toEqual([{ line: 1, message: "left takes a table, wired from a node: heat names none" }]);
    expect(blueprint.nodes[0]?.values).toEqual({});
  });

  it("keeps a node of a kind there is none of, as written, for whoever has that kind", () => {
    const { blueprint, problems } = parseBlueprint("teleport to: mars", kit);
    expect(problems).toEqual([]);
    expect(blueprint.nodes[0]).toMatchObject({ kind: "teleport", values: { to: "mars" } });
  });
});
