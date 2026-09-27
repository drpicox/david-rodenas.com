import type { Snapshot } from "./Snapshot";
import type { SourceGraph } from "./SourceGraph";

/** A snapshot as the graph the rules read, by path; `shippedOnly` leaves the tests and their arrows out. */
export function graphOf(snapshot: Snapshot, shippedOnly = false): SourceGraph {
  const kept = snapshot.modules.filter((module) => !shippedOnly || !module.test);
  const pathOf = new Map(kept.map((module) => [module.id, module.path]));
  return {
    modules: kept.map(({ path, lines, test }) => ({ path, lines, test })),
    dependencies: snapshot.dependencies.flatMap(({ from, to, typeOnly }) => {
      const [a, b] = [pathOf.get(from), pathOf.get(to)];
      return a !== undefined && b !== undefined ? [{ from: a, to: b, typeOnly }] : [];
    }),
  };
}
