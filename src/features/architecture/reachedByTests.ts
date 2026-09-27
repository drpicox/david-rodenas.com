import type { Snapshot } from "./Snapshot";

/**
 * The files that ship which some test imports directly. Directly, and not
 * through another file: a file only reached on the way to something else is
 * run by a test, but no test says what it should do.
 */
export function reachedByTests(snapshot: Snapshot): Set<number> {
  const tests = new Set(snapshot.modules.filter((module) => module.test).map((module) => module.id));
  return new Set(snapshot.dependencies.filter((dependency) => tests.has(dependency.from) && !tests.has(dependency.to)).map((dependency) => dependency.to));
}
