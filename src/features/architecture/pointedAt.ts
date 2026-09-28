import type { Pointing } from "./lensesOf";
import { reachOf } from "./reachOf";
import type { Thread } from "./threadsOf";

/** What pointing at a file brings out of the picture. */
export interface Pointed {
  /** The file, and every file it brings out: the rest step back. */
  readonly tied: ReadonlySet<number>;
  /** What it needs, and what needs it, each at its distance: only when its arrows are what it brings out. */
  readonly needs: ReadonlyMap<number, number>;
  readonly neededBy: ReadonlyMap<number, number>;
  /** `[other, together]` for each file that changed with it, the most often first: only when that is what it brings out. */
  readonly partners: readonly (readonly [number, number])[];
}

const REACH: Readonly<Record<string, number>> = { "1": 1, "2": 2, "3": 3, all: Infinity };

/**
 * What pointing at a file brings out, by what the reader asked to see: its
 * arrows, as far as asked; the group the arrows gather it into; or the files
 * that changed with it. Everything else steps back.
 */
export function pointedAt(focus: number, pointing: Pointing, links: readonly (readonly [number, number])[], groups: ReadonlyMap<number, number> | null, threads: readonly Thread[]): Pointed {
  const nothing = { needs: new Map<number, number>(), neededBy: new Map<number, number>(), partners: [] as [number, number][] };
  if (pointing === "group") {
    const group = groups?.get(focus);
    return { ...nothing, tied: new Set([focus, ...[...(groups ?? [])].filter(([, one]) => one === group).map(([id]) => id)]) };
  }
  if (pointing === "together") {
    const partners = threads
      .flatMap(({ a, b, together }): [number, number][] => (a === focus ? [[b, together]] : b === focus ? [[a, together]] : []))
      .sort((x, y) => y[1] - x[1] || x[0] - y[0]);
    return { ...nothing, partners, tied: new Set([focus, ...partners.map(([other]) => other)]) };
  }
  const depth = REACH[pointing] ?? 1;
  const needs = reachOf(links, focus, depth, "needs");
  const neededBy = reachOf(links, focus, depth, "neededBy");
  return { ...nothing, needs, neededBy, tied: new Set([focus, ...needs.keys(), ...neededBy.keys()]) };
}
