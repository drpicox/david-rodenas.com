import { betweennessOf } from "./betweennessOf";
import { communitiesOf } from "./communitiesOf";
import { reachedByOf } from "./reachedByOf";
import type { HistoryRead } from "./readHistory";
import type { Snapshot } from "./Snapshot";
import { type Standing, standingsOf } from "./standingsOf";

/** A measure worked out once for each thing it is asked of, however often the page asks. */
function once<Of extends object, T>(work: (of: Of) => T): (of: Of) => T {
  const kept = new WeakMap<Of, T>();
  return (of) => {
    if (kept.has(of)) return kept.get(of) as T;
    const done = work(of);
    kept.set(of, done);
    return done;
  };
}

/**
 * The measures of the source that cost a walk over all of it, kept once
 * worked out: the picture and every figure of a page ask for the same
 * snapshot, again at every commit the page is taken back to.
 */
export const measuresOf = {
  /** Where each file stood at each commit of a history. */
  standings: once((read: HistoryRead): Standing[] => standingsOf(read.history, read.snapshots)),
  /** How much each file stands between the others. */
  bridges: once((snapshot: Snapshot) => betweennessOf(snapshot)),
  /** How many files a change to each could reach. */
  reach: once((snapshot: Snapshot) => reachedByOf(snapshot)),
  /** The group the arrows put each file in. */
  groups: once((snapshot: Snapshot) => communitiesOf(snapshot)),
};
