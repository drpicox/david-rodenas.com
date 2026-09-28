import type { Life } from "./Life";

/** For every file, how many commits had changed it by the one shown, that one counted: what a ball sized by its changes is as big as, at that point of the history. */
export function changesUpTo(lives: readonly Life[], at: number): Map<number, number> {
  return new Map(lives.map((life) => [life.id, life.changed.filter((commit) => commit <= at).length]));
}
