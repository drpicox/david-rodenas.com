import { boxOf } from "./boxOf";
import type { History } from "./History";
import type { Snapshot } from "./Snapshot";
import { SWEEP } from "./SWEEP";

/** What the changes at the head of some arrows came with. */
export interface Carried {
  /** Commits that changed the file an arrow points to, counted for every arrow into it. */
  readonly changes: number;
  /** Of those, the ones that changed the file it leaves, too. */
  readonly carried: number;
}

/** One kind of arrow, and how often a change at its head came with a change at its tail. */
export interface Ripple extends Carried {
  /** It crosses from one box into another. */
  readonly across: boolean;
  /** It needs only a type. */
  readonly typeOnly: boolean;
  /** The file most of these changes were to, where it stood the last time, and what they carried: one file can be most of a kind. */
  readonly most: (Carried & { readonly path: string }) | null;
}

/**
 * How often an arrow carries a change, by kind: inside a box or across two,
 * and onto a value or only onto a type — how often a change to a file came
 * with a change to a file that needs it, along an arrow of that kind. Only
 * the arrows the commit found, between files that ship: one it draws has
 * carried nothing yet, and one from a file it takes away carries nothing more.
 * A sweep is left out. Which file most of a kind's changes were to is kept,
 * because a count over one file is that file's story, not the kind's.
 */
export function ripplesOf(history: History, snapshots: readonly Snapshot[], sweep = SWEEP): Ripple[] {
  const kinds = [false, true].flatMap((across) => [false, true].map((typeOnly) => ({ across, typeOnly, changes: 0, carried: 0, heads: new Map<number, { path: string; changes: number; carried: number }>() })));
  history.changes.forEach((change, at) => {
    const snapshot = snapshots[at - 1];
    if (!snapshot || change.changed.length === 0 || change.changed.length > sweep) return;
    const shipped = new Map(snapshot.modules.filter((module) => !module.test).map((module) => [module.id, module.path]));
    const changed = new Set(change.changed);
    const gone = new Set(change.removed);
    for (const { from, to, typeOnly } of snapshot.dependencies) {
      const [tail, head] = [shipped.get(from), shipped.get(to)];
      if (tail === undefined || head === undefined || gone.has(from) || !changed.has(to)) continue;
      const across = boxOf(tail) !== boxOf(head);
      const kind = kinds.find((one) => one.across === across && one.typeOnly === typeOnly);
      if (!kind) continue;
      const carried = changed.has(from) ? 1 : 0;
      const pointed = kind.heads.get(to) ?? { path: head, changes: 0, carried: 0 };
      kind.heads.set(to, { path: head, changes: pointed.changes + 1, carried: pointed.carried + carried });
      kind.changes += 1;
      kind.carried += carried;
    }
  });
  return kinds.map(({ heads, ...kind }) => ({ ...kind, most: [...heads.values()].sort((a, b) => b.changes - a.changes || a.path.localeCompare(b.path))[0] ?? null }));
}
