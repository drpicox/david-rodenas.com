import type { Life } from "./Life";

/**
 * How hot each file is at a commit: one for a change at that very commit,
 * and every older change counted for less, by half every `halfLife` commits.
 * A file being reworked glows; one left alone cools; one changed again warms
 * up again — the trend a count of all its changes hides.
 */
export function heatOf(lives: readonly Life[], at: number, halfLife = 6): Map<number, number> {
  return new Map(lives.map((life) => [life.id, life.changed.filter((commit) => commit <= at).reduce((sum, commit) => sum + 0.5 ** ((at - commit) / halfLife), 0)]));
}
