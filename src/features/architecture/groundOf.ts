import type { Cascade } from "./Cascade";
import type { Standing } from "./standingsOf";

/** A file's ground: the changes the history's own rates would give it, at its distances from each commit's changes, and the changes it had. */
export interface Ground {
  readonly expected: number;
  readonly actual: number;
}

/** Three arrows away and further are one distance: so far few changes are seen that far, and a rate made of a handful says nothing. */
const FAR = 3;
const bucketOf = (distance: number | null) => (distance === null ? null : Math.min(distance, FAR));

/**
 * What each file's ground would lead one to expect, beside what it did. At
 * every commit a file stood some way from the nearest change below it, or
 * with nothing changed below it at all, and the cascade measured how often
 * files standing so changed in that same commit. Added up over the commits,
 * those shares are the changes a file would have had, had it changed only as
 * often as files that stood where it stood: what its ground would lead one to
 * expect. It says nothing of which change moved which — only where a file
 * stood, and how files that stood there did. Beside it, the changes the file
 * had: far above the line, it changed for reasons of its own; far below, it
 * stood where files change, and did not.
 */
export function groundOf(standings: readonly Standing[], cascade: readonly Cascade[], until = Infinity): Map<number, Ground> {
  const counted = new Map<number | null, { seen: number; changed: number }>();
  for (const { distance, seen, changed } of cascade) {
    const bucket = bucketOf(distance);
    const was = counted.get(bucket) ?? { seen: 0, changed: 0 };
    counted.set(bucket, { seen: was.seen + seen, changed: was.changed + changed });
  }
  const share = new Map([...counted].map(([bucket, { seen, changed }]) => [bucket, seen > 0 ? changed / seen : 0]));
  const ground = new Map<number, { expected: number; actual: number }>();
  for (const { at, id, distance, changed } of standings) {
    if (at > until) continue;
    const kept = ground.get(id) ?? { expected: 0, actual: 0 };
    kept.expected += share.get(bucketOf(distance)) ?? 0;
    kept.actual += changed ? 1 : 0;
    ground.set(id, kept);
  }
  return ground;
}
