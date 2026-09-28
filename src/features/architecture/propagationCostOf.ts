import { reachedByOf } from "./reachedByOf";
import type { Snapshot } from "./Snapshot";

/**
 * The share of the source a change to one file can reach, on average: itself,
 * every file that needs it, and every file that needs those, as far as the
 * arrows go — over all the files that ship, as MacCormack, Rusnak and Baldwin
 * measured a design (2006), calling it its propagation cost. It is what an
 * architecture promises at worst; how far changes really went is the history's.
 */
export function propagationCostOf(snapshot: Snapshot): number {
  const reached = [...reachedByOf(snapshot).values()];
  return reached.length > 0 ? reached.reduce((sum, count) => sum + count + 1, 0) / reached.length ** 2 : 0;
}
