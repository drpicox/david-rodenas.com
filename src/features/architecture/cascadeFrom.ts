import type { Cascade } from "./Cascade";
import type { Standing } from "./standingsOf";

/** The cascade counted from where each file stood, up to a commit: the files seen at each distance from the nearest change below them, and how many changed too, the nearest first and nothing changed below last. */
export function cascadeFrom(standings: readonly Standing[], until = Infinity): Cascade[] {
  const tally = new Map<number | null, { seen: number; changed: number }>();
  for (const { at, distance, changed } of standings) {
    if (at > until) continue;
    const counted = tally.get(distance) ?? { seen: 0, changed: 0 };
    tally.set(distance, { seen: counted.seen + 1, changed: counted.changed + (changed ? 1 : 0) });
  }
  return [...tally].map(([distance, counted]) => ({ distance, ...counted })).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}
