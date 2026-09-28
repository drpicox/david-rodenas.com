import type { History } from "./History";
import type { Snapshot } from "./Snapshot";
import { SWEEP } from "./SWEEP";

/** The files seen at one distance from a change, and how many of them changed too. */
export interface Cascade {
  /** Arrows from a file to the nearest other file its commit changed, going the way they point, into what it needs; none when nothing it needs, near or far, changed. */
  readonly distance: number | null;
  /** Files seen at that distance, once for each commit. */
  readonly seen: number;
  /** Of those, the ones the same commit changed. */
  readonly changed: number;
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
 * Whether a change travels up the arrows, and how far: at every commit, each
 * file that ships is counted by how far below it — in what it needs, or what
 * that needs — the nearest other change was, and by whether it changed too.
 * The share that changed at one arrow, at two, and with nothing changed below
 * at all, is how much a file is moved by what it stands on. The arrows are
 * the ones the commit found, not the ones it left: what the design offered a
 * change as it was made, which is the fair test of it. A file the commit
 * brought or took away is not counted, nor is a sweep.
 */
export function cascadeOf(history: History, snapshots: readonly Snapshot[], sweep = SWEEP): Cascade[] {
  const tally = new Map<number | null, { seen: number; changed: number }>();
  history.changes.forEach((change, at) => {
    const snapshot = snapshots[at - 1];
    if (!snapshot || change.changed.length === 0 || change.changed.length > sweep) return;
    const shipped = new Set(snapshot.modules.filter((module) => !module.test).map((module) => module.id));
    const gone = new Set(change.removed);
    const changed = new Set(change.changed.filter((id) => shipped.has(id)));
    const needs = new Map<number, number[]>();
    for (const { from, to } of snapshot.dependencies) if (shipped.has(from) && shipped.has(to)) needs.set(from, [...(needs.get(from) ?? []), to]);
    for (const id of shipped) {
      if (gone.has(id)) continue;
      const distance = nearest(id, needs, changed);
      const counted = tally.get(distance) ?? { seen: 0, changed: 0 };
      tally.set(distance, { seen: counted.seen + 1, changed: counted.changed + (changed.has(id) ? 1 : 0) });
    }
  });
  return [...tally].map(([distance, counted]) => ({ distance, ...counted })).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}
