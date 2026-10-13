import { describe, expect, it } from "vitest";
import type { Blueprint, PlacedNode, Wire } from "../../platform/blueprint/Blueprint";
import { schematicOf } from "./schematicOf";
import { withRow } from "./withRow";

const node = (id: string): PlacedNode => ({ id, kind: "step", x: 0, y: 0, values: {} });
const wire = (from: string, to: string, pin = "table"): Wire => ({ from: { node: from, pin: "table" }, to: { node: to, pin } });
const blueprint: Blueprint = { nodes: ["a", "b", "c", "d"].map(node), wires: [wire("a", "b"), wire("a", "c"), wire("b", "d")] };
const laid = schematicOf(blueprint);
const rows = (put: ReadonlyMap<string, number>) => Object.fromEntries(schematicOf(blueprint, new Map(), put).modules.map((module) => [module.id, module.row]));

describe("the rows the modules of a schematic stand on once a hand has put one on another", () => {
  it("is where each stood, but for the one moved: nothing else follows it", () => {
    expect(Object.fromEntries(laid.modules.map((module) => [module.id, module.row]))).toEqual({ a: 0, b: 0, c: 1, d: 0 });
    expect(Object.fromEntries(withRow(laid.modules, "d", 1))).toEqual({ a: 0, b: 0, c: 1, d: 1 });
    expect(rows(withRow(laid.modules, "d", 1))).toEqual({ a: 0, b: 0, c: 1, d: 1 });
  });

  it("changes its place with what stood there, in its column", () => {
    expect(rows(withRow(laid.modules, "b", 1))).toEqual({ a: 0, b: 1, c: 0, d: 0 });
  });

  it("opens a row under the last, or over the first, for a module put past them", () => {
    expect(rows(withRow(laid.modules, "a", 2))).toEqual({ a: 2, b: 0, c: 1, d: 0 });
    expect(rows(withRow(laid.modules, "c", -1))).toEqual({ a: 1, b: 1, c: 0, d: 1 });
  });

  it("is as it was for a module that is not there", () => {
    expect(Object.fromEntries(withRow(laid.modules, "gone", 1))).toEqual({ a: 0, b: 0, c: 1, d: 0 });
  });
});
