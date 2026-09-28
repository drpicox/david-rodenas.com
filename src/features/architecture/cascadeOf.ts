import { cascadeFrom } from "./cascadeFrom";
import type { History } from "./History";
import type { Snapshot } from "./Snapshot";
import { standingsOf } from "./standingsOf";
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

/**
 * How often a file changes with what it stands on, by distance: every file at
 * every commit, counted by how far below it the nearest other change was, and
 * by whether it changed too. The share that changed at one arrow, at two, and
 * with nothing changed below at all, is how much a file changes with its
 * ground — which way the change went, one commit cannot say.
 */
export function cascadeOf(history: History, snapshots: readonly Snapshot[], sweep = SWEEP): Cascade[] {
  return cascadeFrom(standingsOf(history, snapshots, sweep));
}
