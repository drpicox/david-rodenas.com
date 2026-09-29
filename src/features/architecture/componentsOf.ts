import type { Snapshot } from "./Snapshot";
import { undirectedOf } from "./undirectedOf";

/** The parts of the source joined together, the arrows read either way: each part's files in order, the largest part first. A file joined to nothing is a part of its own. */
export function componentsOf(snapshot: Snapshot): number[][] {
  const { ids, weights } = undirectedOf(snapshot);
  const seen = new Set<number>();
  const parts: number[][] = [];
  for (const start of ids) {
    if (seen.has(start)) continue;
    const part = [start];
    seen.add(start);
    for (let at = 0; at < part.length; at += 1)
      for (const next of weights.get(part[at] ?? start)?.keys() ?? [])
        if (!seen.has(next)) {
          seen.add(next);
          part.push(next);
        }
    parts.push(part.sort((a, b) => a - b));
  }
  return parts.sort((a, b) => b.length - a.length || (a[0] ?? 0) - (b[0] ?? 0));
}
