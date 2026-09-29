import type { Snapshot } from "./Snapshot";
import { undirectedOf } from "./undirectedOf";

/** How much a network's neighbours are neighbours of each other: each file's share, their average, and the share over the whole. */
export interface Clustering {
  readonly local: ReadonlyMap<number, number>;
  readonly average: number;
  /** Joined pairs of neighbours over all pairs of neighbours there are: the triangles, as a share. */
  readonly transitivity: number;
}

/**
 * How much the files a file is joined to are joined to each other, the
 * arrows read either way: for each file, the share of the pairs of its
 * neighbours that are neighbours too (Watts and Strogatz, 1998); its average
 * over every file, one with fewer than two neighbours counting nothing; and
 * the same share over the whole network at once.
 */
export function clusteringOf(snapshot: Snapshot): Clustering {
  const { ids, weights } = undirectedOf(snapshot);
  const local = new Map<number, number>();
  let [closed, pairs] = [0, 0];
  for (const id of ids) {
    const neighbours = [...(weights.get(id)?.keys() ?? [])];
    const possible = (neighbours.length * (neighbours.length - 1)) / 2;
    let joined = 0;
    neighbours.forEach((a, at) => {
      for (const b of neighbours.slice(at + 1)) if (weights.get(a)?.has(b)) joined += 1;
    });
    local.set(id, possible > 0 ? joined / possible : 0);
    [closed, pairs] = [closed + joined, pairs + possible];
  }
  const values = [...local.values()];
  return { local, average: values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0, transitivity: pairs > 0 ? closed / pairs : 0 };
}
