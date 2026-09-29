import { boxOf } from "./boxOf";
import { COMPOSITION } from "./COMPOSITION";
import { couplingsOf } from "./couplingsOf";
import { joinedBy } from "./joinedBy";
import type { HistoryRead } from "./readHistory";
import { snapshotOf } from "./snapshotOf";
import type { SourceGraph } from "./SourceGraph";
import { SWEEP } from "./SWEEP";

/** Two files that keep changing together with nothing written down to hold them, and how often they did. */
export interface Unheld {
  readonly a: string;
  readonly b: string;
  readonly together: number;
}

/**
 * The contracts no import states and no test holds: every two files that
 * ship and stand in the source now, in different boxes, that changed together
 * `least` times or more — the sweeps left out — with no arrow joining them,
 * near or far, and no test that imports both. Two files of one box changing
 * together is what makes the box one, and the composition changes with
 * everything it puts together: both are left out. What changed together is counted over the
 * history; what joins and holds the two is read from the source as it is now,
 * so a test written today holds a pair at once.
 */
export function unheldCouplingsOf(read: HistoryRead, now: SourceGraph, least = 3): Unheld[] {
  const pathOf = new Map(read.snapshots.at(-1)?.modules.map((module) => [module.id, module.path]) ?? []);
  const current = snapshotOf(now);
  const shipped = new Map(current.modules.filter((module) => !module.test).map((module) => [module.path, module.id]));
  const shippedIds = new Set(shipped.values());
  const links = current.dependencies.filter(({ from, to }) => shippedIds.has(from) && shippedIds.has(to)).map(({ from, to }) => [from, to] as const);
  const tests = current.modules.filter((module) => module.test).map((test) => new Set(current.dependencies.filter(({ from }) => from === test.id).map(({ to }) => to)));
  const composition = new Set(COMPOSITION);
  return couplingsOf(read.history, SWEEP, least)
    .flatMap(({ a, b, together }) => {
      const [first = "", second = ""] = [pathOf.get(a) ?? "", pathOf.get(b) ?? ""].sort();
      const [x, y] = [shipped.get(first), shipped.get(second)];
      if (x === undefined || y === undefined || composition.has(first) || composition.has(second) || boxOf(first) === boxOf(second)) return [];
      if (joinedBy(links, x, y) !== "none" || tests.some((imports) => imports.has(x) && imports.has(y))) return [];
      return [{ a: first, b: second, together }];
    })
    .sort((p, q) => q.together - p.together || p.a.localeCompare(q.a) || p.b.localeCompare(q.b));
}
