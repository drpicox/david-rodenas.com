import { boxOf } from "./boxOf";
import { measuresOf } from "./measuresOf";
import { reachOf } from "./reachOf";
import type { Snapshot } from "./Snapshot";

/** Where a file stands in the network of the source. */
export interface Position {
  readonly needs: number;
  readonly neededBy: number;
  /** Files a change to it could reach, following the arrows back all the way. */
  readonly reaches: number;
  /** Files it needs, near or far. */
  readonly dependsOn: number;
  /** Its share of the shortest ways between two other files, the arrows read either way. */
  readonly bridge: number;
  /** Its place by PageRank among the files that ship, first being the most needed by the most needed. */
  readonly rank: { readonly place: number; readonly of: number; readonly share: number };
  readonly closeness: number;
  readonly core: number;
  /** The arrows of the longest chain of what it needs. */
  readonly height: number;
  readonly clustering: number;
  /** The tests that import it directly. */
  readonly tests: number;
  /** The group the arrows put it in: how many files, and in which boxes, the most first. */
  readonly group: { readonly files: number; readonly boxes: readonly (readonly [string, number])[] };
}

/**
 * Where a file stands in the network of the source, in every measure the
 * picture and the page read it by: what it needs and what needs it, near and
 * far; how much it stands between the others; its place by PageRank; how near
 * it is to the rest; how deep in the knot; how tall the stack under it; how
 * clustered its neighbours; the tests that import it; and its group.
 */
export function positionOf(snapshot: Snapshot, id: number): Position {
  const shipped = new Map(snapshot.modules.filter((module) => !module.test).map((module) => [module.id, module.path]));
  const tests = new Set(snapshot.modules.filter((module) => module.test).map((module) => module.id));
  const links = snapshot.dependencies.filter(({ from, to }) => shipped.has(from) && shipped.has(to)).map(({ from, to }) => [from, to] as const);
  const count = (direction: "needs" | "neededBy", depth: number) => reachOf(links, id, depth, direction).size;
  const others = shipped.size - 1;
  const pairs = (others * (others - 1)) / 2;
  const ranks = [...measuresOf.pageRank(snapshot)].sort((a, b) => b[1] - a[1]);
  const place = ranks.findIndex(([other]) => other === id) + 1;
  const groups = measuresOf.groups(snapshot);
  const group = groups.get(id);
  const boxes = new Map<string, number>();
  for (const [other, of] of groups) {
    if (of !== group) continue;
    const box = boxOf(shipped.get(other) ?? "");
    boxes.set(box, (boxes.get(box) ?? 0) + 1);
  }
  return {
    needs: count("needs", 1),
    neededBy: count("neededBy", 1),
    reaches: count("neededBy", Infinity),
    dependsOn: count("needs", Infinity),
    bridge: pairs > 0 ? (measuresOf.bridges(snapshot).get(id) ?? 0) / pairs : 0,
    rank: { place, of: ranks.length, share: measuresOf.pageRank(snapshot).get(id) ?? 0 },
    closeness: measuresOf.paths(snapshot).closeness.get(id) ?? 0,
    core: measuresOf.cores(snapshot).get(id) ?? 0,
    height: measuresOf.heights(snapshot).get(id) ?? 0,
    clustering: measuresOf.clustering(snapshot).local.get(id) ?? 0,
    tests: new Set(snapshot.dependencies.filter(({ from, to }) => to === id && tests.has(from)).map(({ from }) => from)).size,
    group: { files: [...boxes.values()].reduce((sum, files) => sum + files, 0), boxes: [...boxes].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) },
  };
}
