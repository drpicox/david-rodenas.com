import type { Snapshot } from "./Snapshot";

/** What a ball's size can say about its file. */
export type Sizing = "lines" | "neededBy" | "needs" | "reachedBy" | "bridges" | "changes";

/**
 * A measure of each file taken elsewhere, for the sizes the snapshot alone
 * cannot give: the commits that changed it so far, how far a change to it
 * could reach, how much it stands between the others. `most` is the scale,
 * when it should not be the largest now — for the changes, the most any file
 * is changed by the end, so that a ball only grows as the history plays.
 */
export interface Measured {
  readonly counts: ReadonlyMap<number, number>;
  readonly most?: number;
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
 * hotspot — by how many it needs, or by a measure taken elsewhere: how far a
 * change to it could reach, how much it stands between the others, how many
 * commits have changed it so far. By lines, the layout's own size stands,
 * and there is nothing to say.
 */
export function radiiBy(snapshot: Snapshot, sizing: Sizing, measured?: Measured): Map<number, number> | null {
  if (sizing === "lines") return null;
  const counts = sizing === "neededBy" || sizing === "needs" ? countArrows(snapshot, sizing) : (measured?.counts ?? new Map<number, number>());
  const most = Math.max(1, measured?.most ?? 0, ...counts.values());
  return new Map(snapshot.modules.map((module) => [module.id, SMALLEST + (BIGGEST - SMALLEST) * Math.sqrt((counts.get(module.id) ?? 0) / most)]));
}
