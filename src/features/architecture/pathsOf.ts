import type { Snapshot } from "./Snapshot";
import { undirectedOf } from "./undirectedOf";

/** How far apart the files are, the arrows read either way. */
export interface Paths {
  /** The longest of the shortest ways between two files of the largest part joined together. */
  readonly diameter: number;
  /** The mean of those shortest ways, over every pair of that part. */
  readonly mean: number;
  /** For each file, the files it can reach less one, over the sum of the ways to them: 1 when all are next to it. */
  readonly closeness: ReadonlyMap<number, number>;
}

/**
 * How far apart the files that ship are, walking the arrows either way: from
 * every file, the shortest way to every other it can reach. The diameter and
 * the mean are taken over the largest part of the source joined together,
 * where they mean something; a file's closeness (after Freeman, 1978) over
 * whatever part it is in.
 */
export function pathsOf(snapshot: Snapshot): Paths {
  const { ids, weights } = undirectedOf(snapshot);
  // Walked from every file, so walked on numbers: each file a slot of an array, and its distance the number in it.
  const slot = new Map(ids.map((id, at) => [id, at]));
  const next = ids.map((id) => [...(weights.get(id)?.keys() ?? [])].map((other) => slot.get(other) ?? 0));
  const distance = new Int32Array(ids.length);
  const queue = new Int32Array(ids.length);
  const closeness = new Map<number, number>();
  const reach: { reached: number; total: number; farthest: number }[] = [];
  for (const [source, id] of ids.entries()) {
    distance.fill(-1);
    distance[source] = 0;
    queue[0] = source;
    let [reached, total, farthest] = [1, 0, 0];
    for (let at = 0; at < reached; at += 1) {
      const here = queue[at] ?? 0;
      const far = (distance[here] ?? 0) + 1;
      for (const there of next[here] ?? []) {
        if ((distance[there] ?? 0) >= 0) continue;
        distance[there] = far;
        queue[reached] = there;
        reached += 1;
        total += far;
        farthest = far;
      }
    }
    reach.push({ reached, total, farthest });
    closeness.set(id, total > 0 ? (reached - 1) / total : 0);
  }
  // The largest part joined together is the set of files that reach the most.
  const most = Math.max(0, ...reach.map(({ reached }) => reached));
  const largest = reach.filter(({ reached }) => reached === most);
  const pairs = largest.length * (most - 1);
  return {
    diameter: Math.max(0, ...largest.map(({ farthest }) => farthest)),
    mean: pairs > 0 ? largest.reduce((sum, { total }) => sum + total, 0) / pairs : 0,
    closeness,
  };
}
