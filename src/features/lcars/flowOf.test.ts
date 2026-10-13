import { describe, expect, it } from "vitest";
import type { Blueprint, PlacedNode, Wire } from "../../platform/blueprint/Blueprint";
import { flowOf } from "./flowOf";
import { type Schematic, schematicOf } from "./schematicOf";

const node = (id: string): PlacedNode => ({ id, kind: "step", x: 0, y: 0, values: {} });
const wire = (from: string, to: string, pin = "table"): Wire => ({ from: { node: from, pin: "table" }, to: { node: to, pin } });
const laid = (ids: string[], wires: Wire[]) => schematicOf({ nodes: ids.map(node), wires } satisfies Blueprint);
const at = (schematic: Schematic, id: string) => schematic.modules.find((module) => module.id === id)!;
const conduit = (schematic: Schematic, from: string, to: string) => schematic.conduits.find(({ wire: each }) => each.from.node === from && each.to.node === to)!;
const long = (schematic: Schematic, from: string, to: string) => conduit(schematic, from, to).points.reduce((sum, point, index, points) => sum + (index > 0 ? Math.abs(point.x - points[index - 1]!.x) + Math.abs(point.y - points[index - 1]!.y) : 0), 0);

describe("how far along the flow each conduit of a schematic sets out", () => {
  it("is where the module it leaves ends, for one nothing feeds: what flows sets out as a front crossing the display would reach it", () => {
    const schematic = laid(["a", "b"], [wire("a", "b")]);
    expect(flowOf(schematic).get(conduit(schematic, "a", "b").wire)).toBe(at(schematic, "a").x + at(schematic, "a").width);
  });

  it("is further by the conduit before it and by the module between them: what sets out of a module is what came into it", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("b", "c")]);
    const flow = flowOf(schematic);
    const first = flow.get(conduit(schematic, "a", "b").wire) ?? 0;
    expect(flow.get(conduit(schematic, "b", "c").wire)).toBe(first + long(schematic, "a", "b") + at(schematic, "b").width);
  });

  it("waits for the last of what a module is fed: the one that came the longer way", () => {
    const schematic = laid(["a", "b", "low", "both", "end"], [wire("a", "both", "left"), wire("b", "low"), wire("low", "both", "right"), wire("both", "end")]);
    const flow = flowOf(schematic);
    const arrives = (from: string) => (flow.get(conduit(schematic, from, "both").wire) ?? 0) + long(schematic, from, "both");
    expect(arrives("low")).toBeGreaterThan(arrives("a"));
    // A port of two is half a pixel off the row's own level: what is handed on is a whole number.
    expect(flow.get(conduit(schematic, "both", "end").wire)).toBe(Math.round(arrives("low") + at(schematic, "both").width));
  });

  it("gives every conduit a place, whole pixels along, even where the wires go round in a circle", () => {
    const schematic = laid(["a", "b"], [wire("a", "b"), wire("b", "a")]);
    const flow = flowOf(schematic);
    expect([...flow.values()].every((far) => Number.isInteger(far))).toBe(true);
    expect(flow.size).toBe(2);
  });
});
