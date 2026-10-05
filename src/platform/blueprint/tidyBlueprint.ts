import type { Blueprint, PlacedNode } from "./Blueprint";
import type { Kit } from "./kitOf";
import { NODE } from "./NODE";
import { type NodeShape, nodeShapeOf } from "./nodeShapeOf";

const MARGIN = 40;
const ACROSS = 80;
const DOWN = 20;
/** Twice each way is enough for a page's blueprints to settle; more only polishes what nobody sees. */
const SWEEPS = 2;

/** Each node's column: one after the furthest of what it needs; a node that needs nothing stands just before the first that needs it. */
function columnsOf(blueprint: Blueprint): Map<string, number> {
  const upstream = new Map<string, string[]>();
  const downstream = new Map<string, string[]>();
  for (const { from, to } of blueprint.wires) {
    upstream.set(to.node, [...(upstream.get(to.node) ?? []), from.node]);
    downstream.set(from.node, [...(downstream.get(from.node) ?? []), to.node]);
  }
  const column = new Map<string, number>();
  const columnOf = (id: string, seen: ReadonlySet<string>): number => {
    const known = column.get(id);
    if (known !== undefined) return known;
    const before = (upstream.get(id) ?? []).filter((other) => !seen.has(other));
    const value = before.length === 0 ? 0 : 1 + Math.max(...before.map((other) => columnOf(other, new Set([...seen, id]))));
    column.set(id, value);
    return value;
  };
  for (const node of blueprint.nodes) columnOf(node.id, new Set());
  for (const node of blueprint.nodes) {
    const after = downstream.get(node.id) ?? [];
    if ((upstream.get(node.id) ?? []).length === 0 && after.length > 0) column.set(node.id, Math.max(0, Math.min(...after.map((other) => column.get(other) ?? 0)) - 1));
  }
  return column;
}

/**
 * A blueprint with every node placed: in columns, left to right, as the
 * data flows; and down each column, near the nodes its wires join, so that
 * a wire runs level where it can. A few sweeps back and forth, each node
 * drawn towards its neighbours and kept off the nodes beside it — Sugiyama's
 * layered drawing, in the small.
 */
export function tidyBlueprint(blueprint: Blueprint, kit: Kit): Blueprint {
  const shapes = new Map<string, NodeShape>(blueprint.nodes.map((node) => [node.id, nodeShapeOf(kit.kinds.get(node.kind))]));
  const column = columnsOf(blueprint);
  const order = new Map(blueprint.nodes.map((node, at) => [node.id, at]));
  const columns = [...new Set(column.values())].sort((a, b) => a - b);
  const inColumn = (index: number) => blueprint.nodes.filter((node) => column.get(node.id) === index).map((node) => node.id);
  const y = new Map<string, number>();

  // Where a node would stand for the wires to its neighbours on one side to run level: the mean over them.
  const wanted = (id: string, side: "upstream" | "downstream"): number | undefined => {
    const levels = blueprint.wires.flatMap(({ from, to }) => {
      const [mine, theirs] = side === "upstream" ? [to, from] : [from, to];
      if (mine.node !== id || !y.has(theirs.node)) return [];
      const theirPin = shapes.get(theirs.node)?.[side === "upstream" ? "outputs" : "inputs"].get(theirs.pin)?.y ?? 0;
      const myPin = shapes.get(id)?.[side === "upstream" ? "inputs" : "outputs"].get(mine.pin)?.y ?? 0;
      return [(y.get(theirs.node) ?? 0) + theirPin - myPin];
    });
    return levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : undefined;
  };
  // A column, stacked in the order its nodes want to stand, none over another.
  const stack = (ids: readonly string[], side: "upstream" | "downstream") => {
    const wishes = ids.map((id) => ({ id, wish: wanted(id, side) ?? y.get(id) }));
    wishes.sort((a, b) => (a.wish ?? Infinity) - (b.wish ?? Infinity) || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    let below = -Infinity;
    for (const { id, wish } of wishes) {
      const top = Math.max(wish ?? below, below);
      y.set(id, Number.isFinite(top) ? top : 0);
      below = (y.get(id) ?? 0) + (shapes.get(id)?.height ?? 0) + DOWN;
    }
  };

  for (const index of columns) stack(inColumn(index), "upstream");
  for (let sweep = 0; sweep < SWEEPS; sweep += 1) {
    for (const index of [...columns].reverse()) stack(inColumn(index), "downstream");
    for (const index of columns) stack(inColumn(index), "upstream");
  }
  const top = Math.min(...y.values());
  const placed = (node: PlacedNode): PlacedNode => ({ ...node, x: MARGIN + (column.get(node.id) ?? 0) * (NODE.width + ACROSS), y: Math.round((y.get(node.id) ?? 0) - top + MARGIN) });
  return { ...blueprint, nodes: blueprint.nodes.map(placed) };
}
