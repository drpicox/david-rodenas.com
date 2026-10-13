import { describe, expect, it } from "vitest";
import type { PlacedNode, Wire } from "./Blueprint";
import { columnsOf } from "./columnsOf";

const node = (id: string): PlacedNode => ({ id, kind: "step", x: 0, y: 0, values: {} });
const wire = (from: string, to: string): Wire => ({ from: { node: from, pin: "table" }, to: { node: to, pin: "table" } });
const columns = (ids: string[], wires: Wire[]) => Object.fromEntries(columnsOf({ nodes: ids.map(node), wires }));

describe("the column each node of a blueprint stands in, as the data flows", () => {
  it("is one after the furthest of what the node needs", () => {
    expect(columns(["a", "b", "c", "both"], [wire("a", "b"), wire("b", "c"), wire("a", "both"), wire("c", "both")])).toEqual({ a: 0, b: 1, c: 2, both: 3 });
  });

  it("is, for a node that needs nothing, the one just before the first node that needs it", () => {
    expect(columns(["a", "b", "late", "c"], [wire("a", "b"), wire("b", "c"), wire("late", "c")])).toEqual({ a: 0, b: 1, late: 1, c: 2 });
  });

  it("is the first for a node nothing is wired to", () => {
    expect(columns(["alone"], [])).toEqual({ alone: 0 });
  });

  it("is still found where wires go round in a circle, which a text written by hand can say", () => {
    expect(Object.keys(columns(["a", "b"], [wire("a", "b"), wire("b", "a")])).sort()).toEqual(["a", "b"]);
  });
});
