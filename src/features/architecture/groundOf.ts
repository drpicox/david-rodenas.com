import type { Cascade } from "./cascadeOf";
import type { Standing } from "./standingsOf";

/** A file's ground: the changes what it stands on made likely, and the changes it had. */
export interface Ground {
  readonly expected: number;
  readonly actual: number;
}

/**
 * What each file's ground predicted, beside what it did. At every commit, a
 * file is more likely to change the nearer to it, below, something changed —
 * by as much as the cascade measured at that distance over the chance with
 * nothing changed below. Added up over the commits, that is how many changes
 * the file inherited from what it stands on, by the history's own rates: its
 * exposure. Beside it, the changes it had. A file far above its ground changes
 * for reasons of its own; one far below it is shielded from what moves under it.
 */
export function groundOf(standings: readonly Standing[], cascade: readonly Cascade[], until = Infinity): Map<number, Ground> {
  const share = (row: Cascade | undefined) => (row && row.seen > 0 ? row.changed / row.seen : 0);
  const anywhere = share(cascade.find((row) => row.distance === null));
  const excess = new Map(cascade.filter((row) => row.distance !== null).map((row) => [row.distance, Math.max(0, share(row) - anywhere)]));
  const ground = new Map<number, { expected: number; actual: number }>();
  for (const { at, id, distance, changed } of standings) {
    if (at > until) continue;
    const counted = ground.get(id) ?? { expected: 0, actual: 0 };
    counted.expected += distance === null ? 0 : (excess.get(distance) ?? 0);
    counted.actual += changed ? 1 : 0;
    ground.set(id, counted);
  }
  return ground;
}
