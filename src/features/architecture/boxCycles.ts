import { boxOf } from "./boxOf";
import type { SourceGraph } from "./SourceGraph";
import { stronglyConnectedOf } from "./stronglyConnectedOf";

/**
 * Every set of boxes that need each other round in a circle, each set sorted
 * and the sets in order. Found as the strongly connected components of the
 * graph between boxes, because a circle can be as long as it likes and still
 * be one: none of its boxes can be read, or drawn above the others, without
 * all the rest.
 */
export function boxCycles(graph: SourceGraph): string[][] {
  const next = new Map<string, Set<string>>();
  for (const { from, to } of graph.dependencies) {
    const [a, b] = [boxOf(from), boxOf(to)];
    if (a === b) continue;
    if (!next.has(a)) next.set(a, new Set());
    if (!next.has(b)) next.set(b, new Set());
    next.get(a)?.add(b);
  }
  return stronglyConnectedOf([...next.keys()], (box) => next.get(box) ?? [])
    .filter((part) => part.length > 1)
    .map((part) => part.sort())
    .sort((a, b) => (a[0] ?? "").localeCompare(b[0] ?? ""));
}
