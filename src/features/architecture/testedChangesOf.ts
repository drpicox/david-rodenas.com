import type { History } from "./History";
import type { Snapshot } from "./Snapshot";
import { SWEEP } from "./SWEEP";

/** How the changes to the files with something to test went, with their tests or without. */
export interface TestedChanges {
  /** Changes to a file some test imports directly. */
  readonly tested: number;
  /** Of those, the ones whose commit changed one of those tests too, or brought a new one. */
  readonly withTest: number;
  /** Changes to a file with something in it to run that no test imports directly. */
  readonly untested: number;
}

/**
 * The mark test-driven work leaves in a history: a file changes, and its test
 * changes in the same commit, because the test said first what the change
 * would be. Counted over every change to a file with something in it to run —
 * types alone have nothing — leaving a sweep out.
 */
export function testedChangesOf(history: History, snapshots: readonly Snapshot[], sweep = SWEEP): TestedChanges {
  const counted = { tested: 0, withTest: 0, untested: 0 };
  history.changes.forEach((change, at) => {
    const snapshot = snapshots[at];
    if (!snapshot || change.changed.length > sweep) return;
    const module = new Map(snapshot.modules.map((one) => [one.id, one]));
    const testsOf = new Map<number, number[]>();
    for (const { from, to } of snapshot.dependencies) if (module.get(from)?.test && !module.get(to)?.test) testsOf.set(to, [...(testsOf.get(to) ?? []), from]);
    const withIt = new Set([...change.changed, ...change.added.map(([id]) => id)]);
    for (const id of change.changed) {
      const file = module.get(id);
      if (!file || file.test || file.typesOnly) continue;
      const tests = testsOf.get(id) ?? [];
      if (tests.length === 0) counted.untested += 1;
      else {
        counted.tested += 1;
        if (tests.some((test) => withIt.has(test))) counted.withTest += 1;
      }
    }
  });
  return counted;
}
