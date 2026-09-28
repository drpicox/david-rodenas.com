import type { History } from "./History";
import type { Snapshot } from "./Snapshot";
import { SWEEP } from "./SWEEP";

/** One file at one commit: how far below it the nearest other change was, and whether it changed too. */
export interface Standing {
  readonly at: number;
  readonly id: number;
  /** Arrows from the file to the nearest other file its commit changed, the way they point, into what it needs; none when nothing it needs, near or far, changed. */
  readonly distance: number | null;
  readonly changed: boolean;
}

/** Arrows from a file down to the nearest file of a set, breadth first; none when no file of it is below. */
function nearest(start: number, needs: ReadonlyMap<number, readonly number[]>, targets: ReadonlySet<number>): number | null {
  const seen = new Set([start]);
  let frontier = [start];
  for (let distance = 1; frontier.length > 0; distance += 1) {
    const next: number[] = [];
    for (const here of frontier)
      for (const there of needs.get(here) ?? []) {
        if (seen.has(there)) continue;
        if (targets.has(there)) return distance;
        seen.add(there);
        next.push(there);
      }
    frontier = next;
  }
  return null;
}

/**
 * Where each file stood at each commit: every file that ships and was there
 * before it, how far below it — in what it needs, or what that needs — the
 * nearest other change was, and whether it changed too. The arrows are the
 * ones the commit found, not the ones it left: what the design offered a
 * change as it was made. A file the commit took away is not counted, nor is
 * a sweep, nor a commit that changed nothing.
 */
export function standingsOf(history: History, snapshots: readonly Snapshot[], sweep = SWEEP): Standing[] {
  const standings: Standing[] = [];
  history.changes.forEach((change, at) => {
    const snapshot = snapshots[at - 1];
    if (!snapshot || change.changed.length === 0 || change.changed.length > sweep) return;
    const shipped = new Set(snapshot.modules.filter((module) => !module.test).map((module) => module.id));
    const gone = new Set(change.removed);
    const changed = new Set(change.changed.filter((id) => shipped.has(id)));
    const needs = new Map<number, number[]>();
    for (const { from, to } of snapshot.dependencies) if (shipped.has(from) && shipped.has(to)) needs.set(from, [...(needs.get(from) ?? []), to]);
    for (const id of shipped) if (!gone.has(id)) standings.push({ at, id, distance: nearest(id, needs, changed), changed: changed.has(id) });
  });
  return standings;
}
