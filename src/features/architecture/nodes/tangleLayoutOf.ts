import type { Body } from "../Body";
import type { Snapshot } from "../Snapshot";
import { tangleStep } from "../tangleStep";

/** The golden angle: points laid along a spiral at it never line up, so the tangle starts evenly spread and the same every time. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** About this many pushes between pairs of files in all, however many files: a big tangle gets fewer steps, a small one more. */
const WORK = 40_000_000;

/**
 * Where each file of a graph settles with no boxes, only the pull of what it
 * needs and the push of everything else: the tangle the architecture page
 * plays, run to rest at once. It starts from a spiral, never from dice, so
 * the build and the browser draw the same tangle.
 */
export function tangleLayoutOf(snapshot: Snapshot, width: number, height: number): Map<number, { x: number; y: number }> {
  const count = snapshot.modules.length;
  const bodies: Body[] = snapshot.modules.map((_, at) => {
    const radius = Math.sqrt((at + 0.5) / Math.max(1, count)) * Math.min(width, height) * 0.45;
    return { x: width / 2 + Math.cos(at * GOLDEN) * radius, y: height / 2 + Math.sin(at * GOLDEN) * radius, vx: 0, vy: 0 };
  });
  const index = new Map(snapshot.modules.map((module, at) => [module.id, at]));
  const links = snapshot.dependencies.flatMap(({ from, to }) => {
    const [a, b] = [index.get(from), index.get(to)];
    return a !== undefined && b !== undefined && a !== b ? [[a, b] as const] : [];
  });
  const steps = Math.max(40, Math.min(300, Math.round(WORK / Math.max(1, count * count))));
  for (let step = 0; step < steps; step += 1) tangleStep(bodies, links, { width, height, heat: Math.exp((-step / steps) * 3.5) });
  return new Map(snapshot.modules.map((module, at) => [module.id, { x: bodies[at]?.x ?? 0, y: bodies[at]?.y ?? 0 }]));
}
