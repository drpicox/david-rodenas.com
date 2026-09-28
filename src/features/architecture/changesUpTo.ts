import type { Life } from "./Life";

/** For every file, how many commits had changed it by the one shown, that one counted and the sweeps not: what a ball sized by its changes is as big as, at that point of the history. */
export function changesUpTo(lives: readonly Life[], at: number, sweeps: ReadonlySet<number> = new Set()): Map<number, number> {
  return new Map(lives.map((life) => [life.id, life.changed.filter((commit) => commit <= at && !sweeps.has(commit)).length]));
}
