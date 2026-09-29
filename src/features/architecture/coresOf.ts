import type { Snapshot } from "./Snapshot";
import { undirectedOf } from "./undirectedOf";

/**
 * How deep in the knot each file sits: its core number, the largest k for
 * which it stays when every file with fewer than k neighbours is taken away,
 * and taken away again as others lose theirs (Seidman, 1983). The files of the
 * deepest core hold one another up; a file at 1 hangs on by a thread.
 */
export function coresOf(snapshot: Snapshot): Map<number, number> {
  const { ids, weights } = undirectedOf(snapshot);
  const degree = new Map(ids.map((id) => [id, weights.get(id)?.size ?? 0]));
  const core = new Map<number, number>();
  const left = new Set(ids);
  for (let k = 0; left.size > 0; ) {
    const lowest = Math.min(...[...left].map((id) => degree.get(id) ?? 0));
    k = Math.max(k, lowest);
    const peeled = [...left].filter((id) => (degree.get(id) ?? 0) <= k);
    for (const id of peeled) {
      left.delete(id);
      core.set(id, k);
      for (const other of weights.get(id)?.keys() ?? []) if (left.has(other)) degree.set(other, (degree.get(other) ?? 0) - 1);
    }
  }
  return new Map(ids.map((id) => [id, core.get(id) ?? 0]));
}
