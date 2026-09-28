import { boxOf } from "./boxOf";
import type { History } from "./History";
import type { Snapshot } from "./Snapshot";
import { SWEEP } from "./SWEEP";

/** One kind of arrow, and how often a change at its head came with a change at its tail. */
export interface Ripple {
  /** It crosses from one box into another. */
  readonly across: boolean;
  /** It needs only a type. */
  readonly typeOnly: boolean;
  /** Commits that changed the file it points to, counted for every arrow into it. */
  readonly changes: number;
  /** Of those, the ones that changed the file it leaves, too. */
  readonly carried: number;
}

/**
 * How often an arrow carries a change, by kind: inside a box or across two,
 * and onto a value or only onto a type. If depending on an interface rather
 * than on what implements it is what keeps a change where it happened, the
 * arrows onto a type carry fewer — and here that is counted, not assumed.
 * Only arrows between files that ship; not a file the commit brought, nor a sweep.
 */
export function ripplesOf(history: History, snapshots: readonly Snapshot[], sweep = SWEEP): Ripple[] {
  const kinds: { -readonly [Key in keyof Ripple]: Ripple[Key] }[] = [false, true].flatMap((across) => [false, true].map((typeOnly) => ({ across, typeOnly, changes: 0, carried: 0 })));
  history.changes.forEach((change, at) => {
    const snapshot = snapshots[at];
    if (!snapshot || change.changed.length === 0 || change.changed.length > sweep) return;
    const shipped = new Map(snapshot.modules.filter((module) => !module.test).map((module) => [module.id, module.path]));
    const brought = new Set(change.added.map(([id]) => id));
    const changed = new Set(change.changed);
    for (const { from, to, typeOnly } of snapshot.dependencies) {
      const [tail, head] = [shipped.get(from), shipped.get(to)];
      if (tail === undefined || head === undefined || brought.has(from) || !changed.has(to)) continue;
      const across = boxOf(tail) !== boxOf(head);
      const kind = kinds.find((one) => one.across === across && one.typeOnly === typeOnly);
      if (!kind) continue;
      kind.changes += 1;
      if (changed.has(from)) kind.carried += 1;
    }
  });
  return kinds;
}
