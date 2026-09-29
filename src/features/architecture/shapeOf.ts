import { againstStabilityOf } from "./againstStabilityOf";
import { boxLinksOf } from "./boxLinksOf";
import { boxOf } from "./boxOf";
import { COMPOSITION } from "./COMPOSITION";
import { measuresOf } from "./measuresOf";
import { reachedByTests } from "./reachedByTests";
import type { Snapshot } from "./Snapshot";
import { stabilityOf } from "./stabilityOf";

/** What the ratchet holds of the source: counts, each of them worse the higher it goes. */
export interface Shape {
  /** Box arrows against the rule of stable dependencies, the composition's left out. */
  readonly againstStability: number;
  /** How deep the knot is: the deepest core. */
  readonly deepestCore: number;
  /** How tall the stack is: the arrows of the longest chain of what needs what. */
  readonly tallestStack: number;
  /** Files that ship, with something in them to run, that no test imports. */
  readonly untested: number;
}

/**
 * The measures of the source that a ratchet holds, so that none of them gets
 * worse without a test saying so: the box arrows that go against Robert C.
 * Martin's rule of stable dependencies — leaving out the composition's, which
 * has to point at every feature, however unstable — how deep the knot of
 * files is, how tall the stack of what needs what, and how many files have
 * something to run that no test imports.
 */
export function shapeOf(snapshot: Snapshot): Shape {
  const composition = new Set(COMPOSITION.map(boxOf));
  const tested = reachedByTests(snapshot);
  return {
    againstStability: againstStabilityOf(boxLinksOf(snapshot), stabilityOf(snapshot, [])).filter(({ from }) => !composition.has(from)).length,
    deepestCore: Math.max(0, ...measuresOf.cores(snapshot).values()),
    tallestStack: Math.max(0, ...measuresOf.heights(snapshot).values()),
    untested: snapshot.modules.filter((module) => !module.test && !module.typesOnly && !tested.has(module.id)).length,
  };
}
