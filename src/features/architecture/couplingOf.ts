import { boxOf } from "./boxOf";
import type { Snapshot } from "./Snapshot";

/** The files of one box that need, or are needed from, another box. */
export interface Coupled {
  readonly box: string;
  readonly files: number;
}

/** One box's two couplings, as Robert C. Martin counts a component's, file by file. */
export interface Coupling {
  readonly box: string;
  /** Its files that ship. */
  readonly files: readonly number[];
  /** The boxes whose files need something in it, and how many of their files do: together, its afferent couplings. */
  readonly neededBy: readonly Coupled[];
  /** Its own files that need something elsewhere: its efferent couplings. */
  readonly needing: readonly number[];
  /** The boxes those files need, and how many of them need each. */
  readonly needs: readonly Coupled[];
  /** Ca: the files elsewhere that need something in it. */
  readonly ca: number;
  /** Ce: its own files that need something elsewhere. */
  readonly ce: number;
  /** Ce / (Ca + Ce); none with neither. */
  readonly instability: number | null;
}

const counted = (files: ReadonlyMap<string, ReadonlySet<number>>): Coupled[] =>
  [...files].map(([box, ids]) => ({ box, files: ids.size })).sort((a, b) => b.files - a.files || a.box.localeCompare(b.box));

/**
 * One box's two couplings, spelled out: the files elsewhere that need
 * something in it (Ca, its afferent couplings: it is responsible to them), and
 * its own files that need something elsewhere (Ce, its efferent couplings: it
 * depends through them), each with the boxes on the other side. Martin counts
 * files — his classes — not arrows: a file that needs three things elsewhere is
 * one to Ce. Only what ships.
 */
export function couplingOf(snapshot: Snapshot, box: string): Coupling {
  const shipped = new Map(snapshot.modules.filter((module) => !module.test).map((module) => [module.id, boxOf(module.path)]));
  const files = [...shipped].filter(([, of]) => of === box).map(([id]) => id);
  const neededBy = new Map<string, Set<number>>();
  const needs = new Map<string, Set<number>>();
  const needing = new Set<number>();
  for (const { from, to } of snapshot.dependencies) {
    const [a, b] = [shipped.get(from), shipped.get(to)];
    if (a === undefined || b === undefined || a === b) continue;
    if (b === box) neededBy.set(a, (neededBy.get(a) ?? new Set()).add(from));
    if (a === box) {
      needing.add(from);
      needs.set(b, (needs.get(b) ?? new Set()).add(from));
    }
  }
  const ca = new Set([...neededBy.values()].flatMap((ids) => [...ids])).size;
  const ce = needing.size;
  return { box, files, neededBy: counted(neededBy), needing: [...needing].sort((a, b) => a - b), needs: counted(needs), ca, ce, instability: ca + ce > 0 ? ce / (ca + ce) : null };
}
