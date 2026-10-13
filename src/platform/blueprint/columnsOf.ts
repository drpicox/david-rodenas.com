import type { Blueprint } from "./Blueprint";

/**
 * Each node's column, as the data flows from left to right: one after the
 * furthest of what it needs; a node that needs nothing stands just before
 * the first that needs it, beside what it is for, not far away at the start.
 * Whoever lays a blueprint out — the tidying, a schematic of it — reads the
 * columns here, so that they agree on what comes before what.
 */
export function columnsOf(blueprint: Blueprint): Map<string, number> {
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
