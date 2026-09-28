import type { History } from "./History";
import { SWEEP } from "./SWEEP";

/** Two files, and the commits that changed them both. */
export interface Coupling {
  /** The lower number of the two. */
  readonly a: number;
  readonly b: number;
  readonly together: number;
}

/**
 * Every two files that changed in the same commits, and how many, the most
 * first: what has to change together, whether or not an arrow says so. It is
 * the history's own dependency — Gall, Hajek and Jazayeri called it logical
 * coupling (1998) — and the arrows can then be read against it. Being written
 * in the same commit is not changing together, and a sweep is left out.
 */
export function couplingsOf(history: History, sweep = SWEEP, least = 2): Coupling[] {
  const together = new Map<string, number>();
  for (const { changed } of history.changes) {
    if (changed.length > sweep) continue;
    const ids = [...changed].sort((x, y) => x - y);
    ids.forEach((a, at) => {
      for (const key of ids.slice(at + 1).map((b) => `${a}:${b}`)) together.set(key, (together.get(key) ?? 0) + 1);
    });
  }
  return [...together]
    .filter(([, count]) => count >= least)
    .map(([key, count]) => {
      const [a = 0, b = 0] = key.split(":").map(Number);
      return { a, b, together: count };
    })
    .sort((x, y) => y.together - x.together || x.a - y.a || x.b - y.b);
}
