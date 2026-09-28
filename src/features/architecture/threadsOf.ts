import { couplingsOf } from "./couplingsOf";
import type { History } from "./History";
import { joinedBy } from "./joinedBy";
import type { Snapshot } from "./Snapshot";

/** Two files that changed together, to be drawn joined: how often, and what else joins them in the source. */
export interface Thread {
  readonly a: number;
  readonly b: number;
  readonly together: number;
  readonly joined: "arrow" | "through" | "none";
}

/**
 * The threads of what changed together, to draw over the arrows: every two
 * files that ship, standing in the snapshot, that changed in the same commits
 * twice or more — sweeps left out — with what joins them. Where an arrow does,
 * the thread says the arrow carries; where nothing does, the thread is a
 * dependency the source does not state.
 */
export function threadsOf(history: History, snapshot: Snapshot, least = 2): Thread[] {
  const shipped = new Set(snapshot.modules.filter((module) => !module.test).map((module) => module.id));
  const links = snapshot.dependencies.map(({ from, to }) => [from, to] as const);
  return couplingsOf(history, undefined, least)
    .filter(({ a, b }) => shipped.has(a) && shipped.has(b))
    .map(({ a, b, together }) => ({ a, b, together, joined: joinedBy(links, a, b) }));
}
