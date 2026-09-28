import type { Snapshot } from "./Snapshot";

/**
 * For every file that ships, how many others a change to it could reach: every
 * file that needs it, and every file that needs those, as far as the arrows go.
 * Its blast radius, whole. Averaged over the files, with each file reaching
 * itself, it is the design's propagation cost.
 */
export function reachedByOf(snapshot: Snapshot): Map<number, number> {
  const shipped = new Set(snapshot.modules.filter((module) => !module.test).map((module) => module.id));
  const neededBy = new Map<number, number[]>();
  for (const { from, to } of snapshot.dependencies) if (shipped.has(from) && shipped.has(to)) neededBy.set(to, [...(neededBy.get(to) ?? []), from]);
  const reached = new Map<number, number>();
  for (const id of shipped) {
    const seen = new Set([id]);
    const queue = [id];
    for (let here = queue.pop(); here !== undefined; here = queue.pop())
      for (const next of neededBy.get(here) ?? [])
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
    reached.set(id, seen.size - 1);
  }
  return reached;
}
