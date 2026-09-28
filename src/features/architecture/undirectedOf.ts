import type { Snapshot } from "./Snapshot";

/** The files that ship, and for each the others an arrow joins it to, either way, weighed by how many arrows do: the source as the tangle sees it. */
export function undirectedOf(snapshot: Snapshot): { ids: number[]; weights: Map<number, Map<number, number>> } {
  const ids = snapshot.modules.filter((module) => !module.test).map((module) => module.id);
  const weights = new Map<number, Map<number, number>>(ids.map((id) => [id, new Map()]));
  for (const { from, to } of snapshot.dependencies) {
    const [a, b] = [weights.get(from), weights.get(to)];
    if (!a || !b || from === to) continue;
    a.set(to, (a.get(to) ?? 0) + 1);
    b.set(from, (b.get(from) ?? 0) + 1);
  }
  return { ids, weights };
}
