import type { History } from "./History";
import { SWEEP } from "./SWEEP";

/** The commits of a history that were sweeps, by their place in it: those that changed more files than `sweep`. */
export function sweepsOf(history: History, sweep = SWEEP): Set<number> {
  return new Set(history.changes.flatMap((change, at) => (change.changed.length > sweep ? [at] : [])));
}
