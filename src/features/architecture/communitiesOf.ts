import type { Snapshot } from "./Snapshot";
import { undirectedOf } from "./undirectedOf";

/** A graph of groups being merged: each node's arrows to the others, weighed, and the weight of the arrows inside it. */
interface Level {
  readonly links: readonly Map<number, number>[];
  readonly inside: readonly number[];
}

/** One pass of moving each node to the neighbouring group that gains the most modularity, until none gains; the group of each node, or null if nothing moved. */
function moved(level: Level): number[] | null {
  const count = level.links.length;
  const degree = level.links.map((links, node) => 2 * (level.inside[node] ?? 0) + [...links.values()].reduce((sum, weight) => sum + weight, 0));
  const ends = degree.reduce((sum, value) => sum + value, 0);
  const group = Array.from({ length: count }, (_, node) => node);
  const total = [...degree];
  let anyMoved = false;
  for (let changed = true; changed && ends > 0; ) {
    changed = false;
    for (let node = 0; node < count; node += 1) {
      const own = group[node] ?? node;
      const toward = new Map<number, number>();
      for (const [other, weight] of level.links[node] ?? []) {
        const theirs = group[other] ?? other;
        toward.set(theirs, (toward.get(theirs) ?? 0) + weight);
      }
      const k = degree[node] ?? 0;
      total[own] = (total[own] ?? 0) - k;
      const gain = (candidate: number) => (toward.get(candidate) ?? 0) - ((total[candidate] ?? 0) * k) / ends;
      let best = own;
      let bestGain = gain(own);
      for (const candidate of [...toward.keys()].sort((a, b) => a - b)) {
        const value = gain(candidate);
        if (value > bestGain + 1e-12) [best, bestGain] = [candidate, value];
      }
      total[best] = (total[best] ?? 0) + k;
      group[node] = best;
      if (best !== own) changed = anyMoved = true;
    }
  }
  return anyMoved ? group : null;
}

/** The groups of one level, each a node of the next, with the weights between them summed. */
function merged(level: Level, group: readonly number[]): { level: Level; renamed: number[] } {
  const names = new Map<number, number>();
  const renamed = group.map((one) => {
    if (!names.has(one)) names.set(one, names.size);
    return names.get(one) ?? 0;
  });
  const links = Array.from({ length: names.size }, () => new Map<number, number>());
  const inside = Array.from({ length: names.size }, () => 0);
  level.links.forEach((neighbours, node) => {
    const from = renamed[node] ?? 0;
    inside[from] = (inside[from] ?? 0) + (level.inside[node] ?? 0);
    for (const [other, weight] of neighbours) {
      const to = renamed[other] ?? 0;
      // Every arrow is in the links of both its ends: inside a group it is halved, between two it lands once on each.
      if (from === to) inside[from] = (inside[from] ?? 0) + weight / 2;
      else links[from]?.set(to, (links[from]?.get(to) ?? 0) + weight);
    }
  });
  return { level: { links, inside }, renamed };
}

/**
 * The groups the arrows make of the files that ship, with no boxes said: the
 * Louvain method (Blondel and others, 2008), which moves each file to the
 * group that raises the modularity most, then treats every group as one file
 * and starts again, until nothing moves. Every file is visited in order, so
 * the same source always gives the same groups, numbered from 0 in the order
 * of their first file.
 */
export function communitiesOf(snapshot: Snapshot): Map<number, number> {
  const { ids, weights } = undirectedOf(snapshot);
  const position = new Map(ids.map((id, at) => [id, at]));
  let level: Level = { links: ids.map((id) => new Map([...(weights.get(id) ?? [])].map(([other, weight]) => [position.get(other) ?? 0, weight]))), inside: ids.map(() => 0) };
  let belongs = ids.map((_, at) => at);
  for (let group = moved(level); group; group = moved(level)) {
    const next = merged(level, group);
    belongs = belongs.map((node) => next.renamed[node] ?? node);
    level = next.level;
  }
  const names = new Map<number, number>();
  return new Map(
    ids.map((id, at) => {
      const group = belongs[at] ?? at;
      if (!names.has(group)) names.set(group, names.size);
      return [id, names.get(group) ?? 0];
    }),
  );
}
