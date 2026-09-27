import { boxCycles } from "./boxCycles";
import { boxOf } from "./boxOf";
import { graphOf } from "./graphOf";
import type { Metrics } from "./Metrics";
import { reachedByTests } from "./reachedByTests";
import type { Snapshot } from "./Snapshot";

/** The figures of one snapshot, read off the same graph the rules are. */
export function metricsOf(snapshot: Snapshot): Metrics {
  const shipped = graphOf(snapshot, true);
  const crossing = shipped.dependencies.filter((dependency) => boxOf(dependency.from) !== boxOf(dependency.to));
  return {
    files: shipped.modules.length,
    tests: snapshot.modules.length - shipped.modules.length,
    lines: shipped.modules.reduce((sum, module) => sum + module.lines, 0),
    boxes: new Set(shipped.modules.map((module) => boxOf(module.path))).size,
    arrows: shipped.dependencies.length,
    crossing: crossing.length,
    typeOnly: shipped.dependencies.filter((dependency) => dependency.typeOnly).length,
    inCycles: boxCycles(shipped).flat().length,
    tested: reachedByTests(snapshot).size,
  };
}
