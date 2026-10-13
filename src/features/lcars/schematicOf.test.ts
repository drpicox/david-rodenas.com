import { describe, expect, it } from "vitest";
import type { Blueprint, PlacedNode, Wire } from "../../platform/blueprint/Blueprint";
import { SCHEMATIC } from "./SCHEMATIC";
import { type Schematic, schematicOf, type Shape } from "./schematicOf";

const node = (id: string): PlacedNode => ({ id, kind: "step", x: 0, y: 0, values: {} });
const wire = (from: string, to: string, pin = "table", out = "table"): Wire => ({ from: { node: from, pin: out }, to: { node: to, pin } });
const laid = (ids: string[], wires: Wire[], shapes: Record<string, Partial<Shape>> = {}) =>
  schematicOf({ nodes: ids.map(node), wires } satisfies Blueprint, new Map(Object.entries(shapes).map(([id, shape]) => [id, { ins: [], outs: [], rows: 0, ...shape }])));
const at = (schematic: Schematic, id: string) => schematic.modules.find((module) => module.id === id)!;
const conduit = (schematic: Schematic, from: string, to: string) => schematic.conduits.find(({ wire: each }) => each.from.node === from && each.to.node === to)!;
/** The upright runs of a conduit: where it changes level, and between which levels. */
const uprights = (schematic: Schematic, from: string, to: string) =>
  conduit(schematic, from, to).points.flatMap((point, index, points) => {
    const next = points[index + 1];
    return next && next.x === point.x && next.y !== point.y ? [{ x: point.x, from: point.y, to: next.y }] : [];
  });
/** How high a row of modules with nothing written on them is, and the row after it starts. */
const ROW = SCHEMATIC.pad + SCHEMATIC.said + SCHEMATIC.between;
/** Where the first of two ports stands, down a module. */
const FIRST = (SCHEMATIC.pad - SCHEMATIC.port) / 2;

describe("a blueprint laid out as a schematic", () => {
  it("stands a chain of modules level, a column each, and runs a conduit straight from the right end of each to the left of the next", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("b", "c")]);
    expect(["a", "b", "c"].map((id) => [at(schematic, id).column, at(schematic, id).row])).toEqual([[0, 0], [1, 0], [2, 0]]);
    const { points } = conduit(schematic, "a", "b");
    expect(points[0]).toEqual({ x: at(schematic, "a").x + at(schematic, "a").width, y: at(schematic, "a").y + SCHEMATIC.pad / 2 });
    expect(points.at(-1)).toEqual({ x: at(schematic, "b").x, y: at(schematic, "b").y + SCHEMATIC.pad / 2 });
    expect(uprights(schematic, "a", "b")).toEqual([]);
  });

  it("stands what one module feeds one under the other, and turns the conduit to the lower one in the channel between the columns", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("a", "c")]);
    expect([at(schematic, "b").row, at(schematic, "c").row]).toEqual([0, 1]);
    expect(at(schematic, "c").y - at(schematic, "b").y).toBe(ROW);
    const [turn] = uprights(schematic, "a", "c");
    expect(turn?.x).toBeGreaterThan(at(schematic, "a").x + at(schematic, "a").width);
    expect(turn?.x).toBeLessThan(at(schematic, "c").x);
    expect(uprights(schematic, "a", "b")).toEqual([]);
  });

  it("brings each conduit to the port of the input it feeds, the ports one under the other in the order the module has its inputs", () => {
    const wires = [wire("a", "both", "left"), wire("b", "both", "right")];
    const schematic = laid(["a", "b", "both"], wires);
    expect([at(schematic, "a").row, at(schematic, "b").row, at(schematic, "both").row]).toEqual([0, 1, 0]);
    const ends = (drawn: Schematic) => ["a", "b"].map((from) => conduit(drawn, from, "both").points.at(-1)!.y - at(drawn, "both").y);
    expect(ends(schematic)).toEqual([FIRST, FIRST + SCHEMATIC.port]);
    expect(ends(laid(["a", "b", "both"], wires, { both: { ins: ["right", "left"] } }))).toEqual([FIRST + SCHEMATIC.port, FIRST]);
  });

  it("stands a third port under the pad, and lets as many conduits leave a module as it has outputs wired, each from its own", () => {
    const schematic = laid(["a", "b", "c", "all"], [wire("a", "all", "one"), wire("b", "all", "two"), wire("c", "all", "three")]);
    expect(conduit(schematic, "c", "all").points.at(-1)!.y - at(schematic, "all").y).toBe(FIRST + 2 * SCHEMATIC.port);
    const several = laid(["a", "b", "c"], [wire("a", "b", "table", "r"), wire("a", "c", "table", "n")], { a: { outs: ["r", "n"] } });
    expect(["b", "c"].map((to) => conduit(several, "a", to).points[0]!.y - at(several, "a").y)).toEqual([FIRST, FIRST + SCHEMATIC.port]);
  });

  it("makes a row as high as the tallest module standing in it: one told three things is three lines taller, and so is one with four ports", () => {
    const wires = [wire("a", "b"), wire("a", "c")];
    const below = (shapes: Record<string, Partial<Shape>>) => at(laid(["a", "b", "c"], wires, shapes), "c").y;
    expect(below({ b: { ins: ["table"], rows: 3 } })).toBe(ROW + 3 * SCHEMATIC.line);
    expect(below({ a: { outs: ["table"], rows: 1 }, b: { ins: ["table"], rows: 3 } })).toBe(ROW + 3 * SCHEMATIC.line);
    expect(below({ b: { ins: ["table", "one", "two", "three"] } })).toBe(FIRST + 3 * SCHEMATIC.port + FIRST + SCHEMATIC.between);
  });

  it("makes a column as wide as its widest module, which is no wider than what it has: a column of modules nothing feeds has no ports in", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("b", "c")]);
    expect(at(schematic, "a").width).toBe(SCHEMATIC.name + SCHEMATIC.seam + SCHEMATIC.out);
    expect(at(schematic, "b").width).toBe(SCHEMATIC.tab + SCHEMATIC.seam + SCHEMATIC.name + SCHEMATIC.seam + SCHEMATIC.out);
    expect(at(schematic, "c").width).toBe(SCHEMATIC.tab + SCHEMATIC.seam + SCHEMATIC.name);
    expect(at(schematic, "b").x).toBe(at(schematic, "a").width + SCHEMATIC.channel);
    const mixed = laid(["a", "b", "c"], [wire("a", "b"), wire("a", "c")], { c: { ins: ["table"], outs: ["table"] } });
    expect(at(mixed, "b").width).toBe(at(mixed, "c").width);
  });

  it("keeps a conduit that skips a column clear of the modules standing in it", () => {
    const schematic = laid(["a", "b", "c"], [wire("a", "b"), wire("b", "c"), wire("a", "c", "other")]);
    const b = at(schematic, "b");
    const { points } = conduit(schematic, "a", "c");
    const through = points.filter((point) => point.x > b.x - 1 && point.x < b.x + b.width + 1);
    const crossing = points.flatMap((point, index) => {
      const next = points[index + 1];
      return next && next.y === point.y && Math.min(point.x, next.x) < b.x + b.width && Math.max(point.x, next.x) > b.x ? [point.y] : [];
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
    expect(schematic.width).toBe(Math.max(...schematic.modules.map((module) => module.x + module.width)));
    expect(schematic.height).toBe(Math.max(...schematic.modules.map((module) => module.y)) + SCHEMATIC.pad + SCHEMATIC.said);
  });

  it("stands a module nothing is wired to on its own, and an empty blueprint nowhere", () => {
    expect(laid(["alone"], []).modules).toEqual([{ id: "alone", column: 0, row: 0, x: 0, y: 0, width: SCHEMATIC.name }]);
    expect(laid([], [])).toEqual({ width: 0, height: 0, modules: [], conduits: [] });
  });

  it("still draws a wire a text written by hand sends backwards, or to a node that is not there", () => {
    const schematic = laid(["a", "b"], [wire("a", "b"), wire("b", "a", "other"), wire("a", "nowhere")]);
    expect(schematic.conduits.map(({ wire: each }) => `${each.from.node}>${each.to.node}`).sort()).toEqual(["a>b", "b>a"]);
    expect(schematic.conduits.every(({ points }) => points.length >= 2)).toBe(true);
    expect(schematic.conduits.some(({ points }) => points.length > 2)).toBe(true);
  });
});
