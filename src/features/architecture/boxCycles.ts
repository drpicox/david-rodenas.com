import { boxOf } from "./boxOf";
import type { SourceGraph } from "./SourceGraph";

/**
 * Every set of boxes that need each other round in a circle, each set sorted
 * and the sets in order. Found as the strongly connected components of the
 * graph between boxes (Tarjan's), because a circle can be as long as it likes
 * and still be one: none of its boxes can be read, or drawn above the others,
 * without all the rest.
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

  let counter = 0;
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const found: string[][] = [];

  const connect = (box: string): void => {
    index.set(box, counter);
    low.set(box, counter);
    counter += 1;
    stack.push(box);
    onStack.add(box);
    for (const after of next.get(box) ?? []) {
      if (!index.has(after)) {
        connect(after);
        low.set(box, Math.min(low.get(box) ?? 0, low.get(after) ?? 0));
      } else if (onStack.has(after)) {
        low.set(box, Math.min(low.get(box) ?? 0, index.get(after) ?? 0));
      }
    }
    if (low.get(box) !== index.get(box)) return;
    const component: string[] = [];
    for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
      onStack.delete(top);
      component.push(top);
      if (top === box) break;
    }
    if (component.length > 1) found.push(component.sort());
  };

  for (const box of next.keys()) if (!index.has(box)) connect(box);
  return found.sort((a, b) => (a[0] ?? "").localeCompare(b[0] ?? ""));
}
