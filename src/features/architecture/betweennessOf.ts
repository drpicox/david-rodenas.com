import type { Snapshot } from "./Snapshot";

/**
 * How much each file that ships stands between the others: for every two
 * other files, the share of the shortest ways between them — the arrows read
 * either way, as the tangle draws them — that pass through it. Found by
 * Brandes' algorithm (2001). A file high on it is a bridge: take it away and
 * parts of the source that were near each other are far apart, or apart.
 */
export function betweennessOf(snapshot: Snapshot): Map<number, number> {
  const ids = snapshot.modules.filter((module) => !module.test).map((module) => module.id);
  const index = new Map(ids.map((id, at) => [id, at]));
  const count = ids.length;
  // Kept as numbers in arrays, by each file's place in `ids`: a walk from every file is a lot of walking.
  const sets = Array.from({ length: count }, () => new Set<number>());
  for (const { from, to } of snapshot.dependencies) {
    const [a, b] = [index.get(from), index.get(to)];
    if (a === undefined || b === undefined || a === b) continue;
    sets[a]?.add(b);
    sets[b]?.add(a);
  }
  const next = sets.map((set) => [...set]);
  const between = new Float64Array(count);
  const ways = new Float64Array(count);
  const distance = new Int32Array(count);
  const owed = new Float64Array(count);
  const order = new Int32Array(count);
  for (let source = 0; source < count; source += 1) {
    ways.fill(0);
    distance.fill(-1);
    owed.fill(0);
    ways[source] = 1;
    distance[source] = 0;
    let [head, tail] = [0, 0];
    order[tail++] = source;
    while (head < tail) {
      const here = order[head++] ?? 0;
      for (const there of next[here] ?? []) {
        if (distance[there] === -1) {
          distance[there] = (distance[here] ?? 0) + 1;
          order[tail++] = there;
        }
        if (distance[there] === (distance[here] ?? 0) + 1) ways[there] = (ways[there] ?? 0) + (ways[here] ?? 0);
      }
    }
    // Back from the farthest: each file owes its predecessors their share of every way through it.
    for (let at = tail - 1; at > 0; at -= 1) {
      const here = order[at] ?? 0;
      for (const previous of next[here] ?? [])
        if (distance[previous] === (distance[here] ?? 0) - 1) owed[previous] = (owed[previous] ?? 0) + ((ways[previous] ?? 0) / (ways[here] ?? 1)) * (1 + (owed[here] ?? 0));
      between[here] = (between[here] ?? 0) + (owed[here] ?? 0);
    }
  }
  // Every pair was counted from both ends.
  return new Map(ids.map((id, at) => [id, (between[at] ?? 0) / 2]));
}
