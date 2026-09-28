import type { Snapshot } from "./Snapshot";

/** What a ball's size can say about its file. */
export type Sizing = "lines" | "neededBy" | "needs";

/** As big as the layout's biggest ball, so a ball never outgrows the place it has. */
const BIGGEST = 6;
const SMALLEST = 2.2;

/**
 * How big each ball is drawn, when its size says something other than its
 * lines: by how many files need it — the ones a change would reach first, a
 * hotspot — or by how many it needs. By lines, the layout's own size stands,
 * and there is nothing to say.
 */
export function radiiBy(snapshot: Snapshot, sizing: Sizing): Map<number, number> | null {
  if (sizing === "lines") return null;
  const counts = new Map<number, Set<number>>();
  for (const { from, to } of snapshot.dependencies) {
    const [whose, other] = sizing === "neededBy" ? [to, from] : [from, to];
    counts.set(whose, (counts.get(whose) ?? new Set()).add(other));
  }
  const most = Math.max(1, ...[...counts.values()].map((set) => set.size));
  return new Map(snapshot.modules.map((module) => [module.id, SMALLEST + (BIGGEST - SMALLEST) * Math.sqrt((counts.get(module.id)?.size ?? 0) / most)]));
}
