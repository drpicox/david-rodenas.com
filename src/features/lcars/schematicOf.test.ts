import { describe, expect, it } from "vitest";
import type { Blueprint, PlacedNode, Wire } from "../../platform/blueprint/Blueprint";
import { SCHEMATIC } from "./SCHEMATIC";
import { type Schematic, schematicOf } from "./schematicOf";

const node = (id: string): PlacedNode => ({ id, kind: "step", x: 0, y: 0, values: {} });
const wire = (from: string, to: string, pin = "table", out = "table"): Wire => ({ from: { node: from, pin: out }, to: { node: to, pin } });
const laid = (ids: string[], wires: Wire[]) => schematicOf({ nodes: ids.map(node), wires } satisfies Blueprint);
const at = (schematic: Schematic, id: string) => schematic.modules.find((module) => module.id === id)!;
const conduit = (schematic: Schematic, from: string, to: string) => schematic.conduits.find(({ wire: each }) => each.from.node === from && each.to.node === to)!;
/** The upright runs of a conduit: where it changes level, and between which levels. */
const uprights = (schematic: Schematic, from: string, to: string) =>
  conduit(schematic, from, to).points.flatMap((point, index, points) => {
    const next = points[index + 1];
    return next && next.x === point.x && next.y !== point.y ? [{ x: point.x, from: point.y, to: next.y }] : [];
  });

describe("a blueprint laid out as a schematic", () => {
  it("stands a chain of modules level, a column each, and runs a conduit straight from each to the next", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("b", "c")]);
    expect(["a", "b", "c"].map((id) => [at(schematic, id).column, at(schematic, id).row])).toEqual([[0, 0], [1, 0], [2, 0]]);
    const { points } = conduit(schematic, "a", "b");
    expect(points[0]).toEqual({ x: at(schematic, "a").x + SCHEMATIC.module, y: at(schematic, "a").y + SCHEMATIC.pad / 2 });
    expect(points.at(-1)).toEqual({ x: at(schematic, "b").x, y: at(schematic, "b").y + SCHEMATIC.pad / 2 });
    expect(uprights(schematic, "a", "b")).toEqual([]);
  });

  it("stands what one module feeds one under the other, and turns the conduit to the lower one in the channel between the columns", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("a", "c")]);
    expect([at(schematic, "b").row, at(schematic, "c").row]).toEqual([0, 1]);
    expect(at(schematic, "c").y - at(schematic, "b").y).toBe(SCHEMATIC.row);
    const [turn] = uprights(schematic, "a", "c");
    expect(turn?.x).toBeGreaterThan(at(schematic, "a").x + SCHEMATIC.module);
    expect(turn?.x).toBeLessThan(at(schematic, "c").x);
    expect(uprights(schematic, "a", "b")).toEqual([]);
  });

  it("stands a module between the two it joins, each arriving at its own place on its end", () => {
    const schematic = laid(["a", "b", "both"], [wire("a", "both", "left"), wire("b", "both", "right")]);
    expect([at(schematic, "a").row, at(schematic, "b").row, at(schematic, "both").row]).toEqual([0, 1, 0]);
    const [level, below] = [conduit(schematic, "a", "both").points.at(-1)!, conduit(schematic, "b", "both").points.at(-1)!];
    expect(level.y).toBe(at(schematic, "both").y + SCHEMATIC.pad / 2);
    expect(below.y).toBe(level.y + SCHEMATIC.port);
  });

  it("keeps a conduit that skips a column clear of the modules standing in it", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("b", "c"), wire("a", "c", "other")]);
    const b = at(schematic, "b");
    const through = conduit(schematic, "a", "c").points.filter((point) => point.x > b.x - 1 && point.x < b.x + SCHEMATIC.module + 1);
    const { points } = conduit(schematic, "a", "c");
    const crossing = points.flatMap((point, index) => {
      const next = points[index + 1];
      return next && next.y === point.y && Math.min(point.x, next.x) < b.x + SCHEMATIC.module && Math.max(point.x, next.x) > b.x ? [point.y] : [];
    });
    expect(through).toEqual([]);
    expect(crossing.length).toBeGreaterThan(0);
    for (const y of crossing) expect(y < b.y || y > b.y + SCHEMATIC.pad).toBe(true);
  });

  it("gives the conduits of different modules their own lanes in a channel they share, and those of one output the same", () => {
    const schematic = laid(["a", "b", "x", "y", "z"], [wire("a", "y"), wire("a", "z"), wire("b", "x"), wire("b", "z", "other")]);
    const lanes = (from: string, to: string) => uprights(schematic, from, to).map((turn) => turn.x);
    const [one, other] = [lanes("a", "z")[0], lanes("b", "x")[0]];
    expect(one).toBeDefined();
    expect(other).toBeDefined();
    expect(Math.abs((one ?? 0) - (other ?? 0))).toBeGreaterThanOrEqual(SCHEMATIC.lane);
    const fanned = laid(["a", "b", "c", "d"], [wire("a", "b"), wire("a", "c"), wire("a", "d")]);
    expect(uprights(fanned, "a", "c")[0]?.x).toBe(uprights(fanned, "a", "d")[0]?.x);
  });

  it("lets no two modules stand in one place, and is as wide and as high as what stands in it", () => {
    const schematic = laid(["a", "b", "c", "d", "e"], [wire("a", "c"), wire("b", "c", "other"), wire("c", "d"), wire("c", "e")]);
    const places = schematic.modules.map((module) => `${module.column}:${module.row}`);
    expect(new Set(places).size).toBe(places.length);
    expect(schematic.width).toBe(Math.max(...schematic.modules.map((module) => module.x + SCHEMATIC.module)));
    expect(schematic.height).toBe(Math.max(...schematic.modules.map((module) => module.y)) + SCHEMATIC.row);
  });

  it("stands a module nothing is wired to on its own, and an empty blueprint nowhere", () => {
    expect(laid(["alone"], []).modules).toEqual([{ id: "alone", column: 0, row: 0, x: 0, y: 0 }]);
    expect(laid([], [])).toEqual({ width: 0, height: 0, modules: [], conduits: [] });
  });

  it("still draws a wire a text written by hand sends backwards, or to a node that is not there", () => {
    const schematic = laid(["a", "b"], [wire("a", "b"), wire("b", "a", "other"), wire("a", "nowhere")]);
    expect(schematic.conduits.map(({ wire: each }) => `${each.from.node}>${each.to.node}`).sort()).toEqual(["a>b", "b>a"]);
    expect(schematic.conduits.every(({ points }) => points.length >= 2)).toBe(true);
    expect(schematic.conduits.some(({ points }) => points.length > 2)).toBe(true);
  });
});
