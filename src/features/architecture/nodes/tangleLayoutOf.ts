import type { Body } from "../Body";
import type { Snapshot } from "../Snapshot";
import { tangleStep } from "../tangleStep";

/** How many times the spiral the files start on winds round: enough that files next to each other in the list start next to each other on it. */
const TURNS = 5;
/** About this many pushes between pairs of files in all, however many files: a big tangle gets fewer steps, a small one more. */
const WORK = 60_000_000;
const ROOM = 2;
const MARGIN = 16;

/**
 * Where each file of a graph settles with no boxes, only the pull of what it
 * needs and the push of everything else: the tangle the architecture page
 * plays, run to rest at once. It starts from a spiral, never from dice, so
 * the build and the browser draw the same tangle.
 */
export function tangleLayoutOf(snapshot: Snapshot, width: number, height: number): Map<number, { x: number; y: number }> {
  // Settled in a room twice as big, then fitted into the picture: in a room its own size, the files would end up pressed against its walls.
  const [roomWidth, roomHeight] = [width * ROOM, height * ROOM];
  const count = snapshot.modules.length;
  // The files start along a spiral in the order of their paths, so a box's files start together and the forces only have to pull boxes apart.
  const order = new Map([...snapshot.modules].sort((a, b) => a.path.localeCompare(b.path)).map((module, at) => [module.id, at]));
  const bodies: Body[] = snapshot.modules.map((module) => {
    const share = ((order.get(module.id) ?? 0) + 0.5) / Math.max(1, count);
    const [angle, radius] = [share * TURNS * Math.PI * 2, (0.12 + 0.88 * share) * Math.min(width, height) * 0.45];
    return { x: roomWidth / 2 + Math.cos(angle) * radius, y: roomHeight / 2 + Math.sin(angle) * radius, vx: 0, vy: 0 };
  });
  const index = new Map(snapshot.modules.map((module, at) => [module.id, at]));
  const links = snapshot.dependencies.flatMap(({ from, to }) => {
    const [a, b] = [index.get(from), index.get(to)];
    return a !== undefined && b !== undefined && a !== b ? [[a, b] as const] : [];
  });
  const steps = Math.max(60, Math.min(400, Math.round(WORK / Math.max(1, count * count))));
  for (let step = 0; step < steps; step += 1) tangleStep(bodies, links, { width: roomWidth, height: roomHeight, heat: Math.exp((-step / steps) * 2.5) });
  const xs = bodies.map((body) => body.x);
  const ys = bodies.map((body) => body.y);
  const [left, top] = [Math.min(...xs), Math.min(...ys)];
  const scale = Math.min((width - MARGIN * 2) / Math.max(1, Math.max(...xs) - left), (height - MARGIN * 2) / Math.max(1, Math.max(...ys) - top), 1);
  const [dx, dy] = [(width - (Math.max(...xs) - left) * scale) / 2, (height - (Math.max(...ys) - top) * scale) / 2];
  return new Map(snapshot.modules.map((module, at) => [module.id, { x: dx + ((bodies[at]?.x ?? 0) - left) * scale, y: dy + ((bodies[at]?.y ?? 0) - top) * scale }]));
}
