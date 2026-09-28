import type { Snapshot } from "./Snapshot";

/** What a ball's size can say about its file. */
export type Sizing = "lines" | "neededBy" | "needs" | "changes";

/** The commits that changed each file so far, and the most any file is changed by the end: the scale a ball grows on while the history plays. */
export interface ChangeCounts {
  readonly counts: ReadonlyMap<number, number>;
  readonly most: number;
}

/** As big as the layout's biggest ball, so a ball never outgrows the place it has. */
const BIGGEST = 6;
const SMALLEST = 2.2;

/** For every file, the others it is joined to one way: what needs it, or what it needs. */
function countArrows(snapshot: Snapshot, sizing: "neededBy" | "needs"): Map<number, number> {
  const others = new Map<number, Set<number>>();
  for (const { from, to } of snapshot.dependencies) {
    const [whose, other] = sizing === "neededBy" ? [to, from] : [from, to];
    others.set(whose, (others.get(whose) ?? new Set()).add(other));
  }
  return new Map([...others].map(([id, set]) => [id, set.size]));
}

/**
 * How big each ball is drawn, when its size says something other than its
 * lines: by how many files need it — the ones a change would reach first, a
 * hotspot — by how many it needs, or by how many commits have changed it so
 * far, which grows as the history plays and stops where the file settled. By
 * lines, the layout's own size stands, and there is nothing to say.
 */
export function radiiBy(snapshot: Snapshot, sizing: Sizing, changes?: ChangeCounts): Map<number, number> | null {
  if (sizing === "lines") return null;
  const counts = sizing === "changes" ? (changes?.counts ?? new Map<number, number>()) : countArrows(snapshot, sizing);
  const most = Math.max(1, sizing === "changes" ? (changes?.most ?? 0) : 0, ...counts.values());
  return new Map(snapshot.modules.map((module) => [module.id, SMALLEST + (BIGGEST - SMALLEST) * Math.sqrt((counts.get(module.id) ?? 0) / most)]));
}
