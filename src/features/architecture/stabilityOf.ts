import { boxOf } from "./boxOf";
import type { Life } from "./Life";
import type { Snapshot } from "./Snapshot";

/** A box measured as a component is in Robert C. Martin's metrics, with how often its files have changed beside them. */
export interface BoxStability {
  readonly box: string;
  readonly files: number;
  /** Files elsewhere that need something in it: its afferent couplings, Ca. */
  readonly neededBy: number;
  /** Its own files that need something elsewhere: its efferent couplings, Ce. */
  readonly needs: number;
  /** Ce / (Ca + Ce), from 0, needed and needing nothing, so hard to change, to 1, needing and not needed, so free to. None for a box with neither. */
  readonly instability: number | null;
  /** The share of its files that are nothing but types: what can be depended on without depending on what it does. */
  readonly abstractness: number;
  /** Every commit that changed one of its files, over their whole lives, sweeps left out. */
  readonly changes: number;
}

/**
 * Every box of a snapshot, as Martin measures a component: how unstable its
 * place is — how little needs it — and how abstract. His instability is not
 * about change at all: it is how free a box is to change, given what would
 * have to change with it. How often it did is beside it, from the history,
 * because the two disagreeing is what hurts: a box everything needs that
 * keeps changing. Only what ships is counted; the tests are not the design.
 * Nor are the `sweeps`: a commit that renames the whole source changes a box
 * without anything about the box having changed.
 */
export function stabilityOf(snapshot: Snapshot, lives: readonly Life[], sweeps: ReadonlySet<number> = new Set()): BoxStability[] {
  const shipped = snapshot.modules.filter((module) => !module.test);
  const boxOfId = new Map(shipped.map((module) => [module.id, boxOf(module.path)]));
  const changesOf = new Map(lives.map((life) => [life.id, life.changed.filter((at) => !sweeps.has(at)).length]));
  const neededBy = new Map<string, Set<number>>();
  const needs = new Map<string, Set<number>>();
  for (const { from, to } of snapshot.dependencies) {
    const [a, b] = [boxOfId.get(from), boxOfId.get(to)];
    if (a === undefined || b === undefined || a === b) continue;
    needs.set(a, (needs.get(a) ?? new Set()).add(from));
    neededBy.set(b, (neededBy.get(b) ?? new Set()).add(from));
  }
  const boxes = [...new Set(boxOfId.values())].sort((a, b) => a.localeCompare(b));
  return boxes.map((box) => {
    const files = shipped.filter((module) => boxOfId.get(module.id) === box);
    const [ca, ce] = [neededBy.get(box)?.size ?? 0, needs.get(box)?.size ?? 0];
    return {
      box,
      files: files.length,
      neededBy: ca,
      needs: ce,
      instability: ca + ce > 0 ? ce / (ca + ce) : null,
      abstractness: files.filter((module) => module.typesOnly).length / files.length,
      changes: files.reduce((sum, module) => sum + (changesOf.get(module.id) ?? 0), 0),
    };
  });
}
