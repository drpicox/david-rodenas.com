import { assortativityOf } from "./assortativityOf";
import { componentsOf } from "./componentsOf";
import { measuresOf } from "./measuresOf";
import type { Snapshot } from "./Snapshot";
import { stronglyConnectedOf } from "./stronglyConnectedOf";
import { undirectedOf } from "./undirectedOf";

/** The source seen as a network, in the measures network science reads any network by. */
export interface Network {
  readonly files: number;
  /** Files that need another, each pair once. */
  readonly arrows: number;
  /** Pairs of files joined by an arrow either way. */
  readonly links: number;
  /** The arrows there are over the arrows there could be. */
  readonly density: number;
  /** Links a file has, on average. */
  readonly meanDegree: number;
  readonly parts: number;
  readonly largestPart: number;
  /** Sets of files that need each other round in a circle, and the files in them. */
  readonly circles: number;
  readonly inCircles: number;
  readonly diameter: number;
  readonly meanPath: number;
  readonly clustering: number;
  readonly transitivity: number;
  readonly assortativity: number;
  readonly deepestCore: number;
  /** The longest chain of what needs what, in arrows. */
  readonly tallest: number;
  /** Files nothing needs, and files that need nothing. */
  readonly sources: number;
  readonly sinks: number;
  /** What a random network of as many files and links would have: its clustering, the chance two files are joined; its paths, the log of the files over the log of the mean degree. */
  readonly randomClustering: number;
  readonly randomPath: number;
  /** Its clustering over the random one's, over its paths over the random one's: well over 1, a small world; none where there is nothing to compare. */
  readonly smallWorld: number;
  /** Every file's degree in — how many need it — and out, for how they are spread. */
  readonly neededBy: readonly number[];
  readonly needs: readonly number[];
}

/**
 * The source as a network, read the way network science reads any network:
 * how many files and arrows, how dense, in how many parts, with how many
 * circles; how far apart its files are and how clustered (Watts and Strogatz,
 * 1998), set against a random network of as many files and links; whether
 * busy files join busy ones; how deep its knot and how tall its stack; and how
 * the files' degrees are spread. Only what ships.
 */
export function networkOf(snapshot: Snapshot): Network {
  const ids = snapshot.modules.filter((module) => !module.test).map((module) => module.id);
  const shipped = new Set(ids);
  const needs = new Map<number, Set<number>>(ids.map((id) => [id, new Set()]));
  const neededBy = new Map<number, Set<number>>(ids.map((id) => [id, new Set()]));
  for (const { from, to } of snapshot.dependencies) {
    if (!shipped.has(from) || !shipped.has(to) || from === to) continue;
    needs.get(from)?.add(to);
    neededBy.get(to)?.add(from);
  }
  const files = ids.length;
  const arrows = [...needs.values()].reduce((sum, set) => sum + set.size, 0);
  const { weights } = undirectedOf(snapshot);
  const links = [...weights.values()].reduce((sum, set) => sum + set.size, 0) / 2;
  const meanDegree = files > 0 ? (2 * links) / files : 0;
  const parts = componentsOf(snapshot);
  const circles = stronglyConnectedOf(ids, (id) => needs.get(id) ?? []).filter((part) => part.length > 1);
  const paths = measuresOf.paths(snapshot);
  const clustering = measuresOf.clustering(snapshot);
  const randomClustering = files > 1 ? meanDegree / (files - 1) : 0;
  const randomPath = meanDegree > 1 ? Math.log(files) / Math.log(meanDegree) : 0;
  const smallWorld = randomClustering > 0 && randomPath > 0 && paths.mean > 0 ? clustering.average / randomClustering / (paths.mean / randomPath) : 0;
  return {
    files,
    arrows,
    links,
    density: files > 1 ? arrows / (files * (files - 1)) : 0,
    meanDegree,
    parts: parts.length,
    largestPart: parts[0]?.length ?? 0,
    circles: circles.length,
    inCircles: circles.reduce((sum, part) => sum + part.length, 0),
    diameter: paths.diameter,
    meanPath: paths.mean,
    clustering: clustering.average,
    transitivity: clustering.transitivity,
    assortativity: assortativityOf(snapshot),
    deepestCore: Math.max(0, ...measuresOf.cores(snapshot).values()),
    tallest: Math.max(0, ...measuresOf.heights(snapshot).values()),
    sources: ids.filter((id) => (neededBy.get(id)?.size ?? 0) === 0).length,
    sinks: ids.filter((id) => (needs.get(id)?.size ?? 0) === 0).length,
    randomClustering,
    randomPath,
    smallWorld,
    neededBy: ids.map((id) => neededBy.get(id)?.size ?? 0),
    needs: ids.map((id) => needs.get(id)?.size ?? 0),
  };
}
