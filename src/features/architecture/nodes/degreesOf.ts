import type { Snapshot } from "../Snapshot";

/** For every node, how many others need it and how many it needs, each other counted once, itself never. */
export function degreesOf(snapshot: Snapshot): { neededBy: Map<number, number>; needs: Map<number, number> } {
  const neededBy = new Map<number, Set<number>>();
  const needs = new Map<number, Set<number>>();
  for (const { from, to } of snapshot.dependencies) {
    if (from === to) continue;
    neededBy.set(to, (neededBy.get(to) ?? new Set()).add(from));
    needs.set(from, (needs.get(from) ?? new Set()).add(to));
  }
  const counted = (sets: Map<number, Set<number>>) => new Map(snapshot.modules.map((module) => [module.id, sets.get(module.id)?.size ?? 0]));
  return { neededBy: counted(neededBy), needs: counted(needs) };
}
