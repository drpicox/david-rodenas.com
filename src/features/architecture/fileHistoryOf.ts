import { cascadeFrom } from "./cascadeFrom";
import { type Ground, groundOf } from "./groundOf";
import { heatOf } from "./heatOf";
import type { Commit } from "./History";
import { historyUpTo } from "./historyUpTo";
import { measuresOf } from "./measuresOf";
import type { HistoryRead } from "./readHistory";
import { sweepsOf } from "./sweepsOf";
import { threadsOf } from "./threadsOf";

/** A file's history up to a commit, as its details tell it. */
export interface FileHistory {
  readonly born: { readonly at: number; readonly commit: Commit };
  /** Every commit that changed it, up to the one shown; a sweep is marked, since it says little of the file. */
  readonly changes: readonly { readonly at: number; readonly commit: Commit; readonly sweep: boolean }[];
  /** One for a change at the commit shown, less for older ones; sweeps left out. */
  readonly heat: number;
  /** What its ground would lead one to expect, beside what it did; none for a file with no commit to count yet. */
  readonly ground: Ground | null;
  /** The files it changed together with most, twice or more, and what joins them. */
  readonly partners: readonly { readonly id: number; readonly path: string; readonly together: number; readonly joined: "arrow" | "through" | "none" }[];
}

const PARTNERS = 5;

/**
 * A file's history up to the commit shown, as its details tell it: the commit
 * that wrote it, every commit that changed it, how hot it is now, what its
 * ground would lead one to expect against what it did, and the files it
 * changed together with most.
 */
export function fileHistoryOf(read: HistoryRead, at: number, id: number): FileHistory {
  const then = historyUpTo(read, at);
  const life = then.lives.find((one) => one.id === id);
  const commits = read.history.commits;
  const sweeps = sweepsOf(then.history);
  const born = life?.born ?? 0;
  const standings = measuresOf.standings(read);
  const snapshot = read.snapshots[at] ?? { modules: [], dependencies: [] };
  const pathOf = new Map(snapshot.modules.map((module) => [module.id, module.path]));
  return {
    born: { at: born, commit: commits[born] ?? { sha: "", date: "", subject: "" } },
    changes: (life?.changed ?? []).map((commit) => ({ at: commit, commit: commits[commit] ?? { sha: "", date: "", subject: "" }, sweep: sweeps.has(commit) })),
    heat: Math.min(1, heatOf(then.lives, at, undefined, sweeps).get(id) ?? 0),
    ground: groundOf(standings, cascadeFrom(standings, at), at).get(id) ?? null,
    partners: threadsOf(then.history, snapshot)
      .flatMap(({ a, b, together, joined }) => (a === id || b === id ? [{ id: a === id ? b : a, together, joined }] : []))
      .sort((x, y) => y.together - x.together || x.id - y.id)
      .slice(0, PARTNERS)
      .map((partner) => ({ ...partner, path: pathOf.get(partner.id) ?? "" })),
  };
}
