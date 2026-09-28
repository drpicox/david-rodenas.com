import type { Snapshot } from "./Snapshot";

/**
 * The share of the source a change to one file can reach, on average: itself,
 * every file that needs it, and every file that needs those, as far as the
 * arrows go — over all the files that ship, as MacCormack, Rusnak and Baldwin
 * measured a design (2006), calling it its propagation cost. It is what an
 * architecture promises at worst; how far changes really went is the history's.
 */
export function propagationCostOf(snapshot: Snapshot): number {
  const shipped = new Set(snapshot.modules.filter((module) => !module.test).map((module) => module.id));
  const neededBy = new Map<number, number[]>();
  for (const { from, to } of snapshot.dependencies) if (shipped.has(from) && shipped.has(to)) neededBy.set(to, [...(neededBy.get(to) ?? []), from]);
  let reachable = 0;
  for (const id of shipped) {
    const reached = new Set([id]);
    const queue = [id];
    for (let here = queue.pop(); here !== undefined; here = queue.pop())
      for (const next of neededBy.get(here) ?? [])
        if (!reached.has(next)) {
          reached.add(next);
          queue.push(next);
        }
    reachable += reached.size;
  }
  return shipped.size > 0 ? reachable / shipped.size ** 2 : 0;
}
