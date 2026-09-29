import type { Snapshot } from "./Snapshot";

/**
 * How much each file that ships is needed, by files that are themselves
 * needed: PageRank (Brin and Page, 1998), with a file's rank flowing to what
 * it needs, as a page's flows to what it links to. A file everything needs
 * directly scores high; so does one needed only by a few, if those few are
 * needed by much. The ranks share out a whole.
 */
export function pageRankOf(snapshot: Snapshot, damping = 0.85): Map<number, number> {
  const ids = snapshot.modules.filter((module) => !module.test).map((module) => module.id);
  const index = new Map(ids.map((id, at) => [id, at]));
  const count = ids.length;
  const needs = Array.from({ length: count }, () => new Set<number>());
  for (const { from, to } of snapshot.dependencies) {
    const [a, b] = [index.get(from), index.get(to)];
    if (a !== undefined && b !== undefined && a !== b) needs[a]?.add(b);
  }
  let rank = new Float64Array(count).fill(count > 0 ? 1 / count : 0);
  for (let round = 0; round < 100; round += 1) {
    const next = new Float64Array(count).fill((1 - damping) / Math.max(1, count));
    // What a file that needs nothing would pass on goes to every file alike.
    let unpassed = 0;
    needs.forEach((targets, at) => {
      const share = rank[at] ?? 0;
      if (targets.size === 0) unpassed += share;
      else for (const target of targets) next[target] = (next[target] ?? 0) + (damping * share) / targets.size;
    });
    for (let at = 0; at < count; at += 1) next[at] = (next[at] ?? 0) + (damping * unpassed) / count;
    const moved = next.reduce((sum, value, at) => sum + Math.abs(value - (rank[at] ?? 0)), 0);
    rank = next;
    if (moved < 1e-12) break;
  }
  return new Map(ids.map((id, at) => [id, rank[at] ?? 0]));
}
