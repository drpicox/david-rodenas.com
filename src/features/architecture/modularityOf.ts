import type { Snapshot } from "./Snapshot";
import { undirectedOf } from "./undirectedOf";

/**
 * How well a grouping of the files follows the arrows: the share of the arrows
 * that fall inside the groups, less the share that would, were the same files
 * joined by as many arrows at random — Newman and Girvan's modularity (2004).
 * Near nothing, the groups say nothing the arrows do; the higher, the more the
 * arrows keep to their groups.
 */
export function modularityOf(snapshot: Snapshot, groups: ReadonlyMap<number, number>): number {
  const { ids, weights } = undirectedOf(snapshot);
  const degree = (id: number) => [...(weights.get(id)?.values() ?? [])].reduce((sum, weight) => sum + weight, 0);
  const ends = ids.reduce((sum, id) => sum + degree(id), 0);
  if (ends === 0) return 0;
  const inside = new Map<number, number>();
  const touching = new Map<number, number>();
  for (const id of ids) {
    const group = groups.get(id) ?? -1 - id;
    touching.set(group, (touching.get(group) ?? 0) + degree(id));
    for (const [other, weight] of weights.get(id) ?? []) if ((groups.get(other) ?? -1 - other) === group) inside.set(group, (inside.get(group) ?? 0) + weight);
  }
  // Each arrow inside a group was counted from both its ends, as each is in `ends`.
  return [...touching].reduce((sum, [group, degrees]) => sum + (inside.get(group) ?? 0) / ends - (degrees / ends) ** 2, 0);
}
