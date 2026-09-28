import type { Body } from "./Body";

/** Every file pushes every other away, as charges do. */
const REPULSION = 900;
/** What a file needs pulls it, as a spring, to this far away. */
const REST = 34;
const PULL = 0.02;
/** A weak pull to the middle, so the tangle stays one tangle. */
const GRAVITY = 0.004;
/** How much of its speed a ball keeps from one step to the next. */
const FRICTION = 0.82;
/** Two files almost on each other push no harder than this: closer, the push would fling them. */
const CLOSEST = 100;
/** No file moves further than this in a step, however it is pushed: a crowd jostles, it does not explode. */
const FASTEST = 12;

/**
 * One step of the tangle: the files with no boxes, only the forces of what
 * they need. It is a plain force-directed layout (Fruchterman and Reingold's
 * idea: charges apart, springs together, friction to settle), and it is what
 * a code base looks like before anyone has said where anything goes.
 *
 * As in theirs, it cools: `heat` is how far a file may move in a step, from
 * one when the tangle begins down to nearly nothing, so a crowd as big as
 * this site's comes to rest instead of shaking for ever; and the walls take
 * the speed out of whatever runs into them.
 */
export function tangleStep(bodies: Body[], links: readonly (readonly [number, number])[], { width, height, heat = 1 }: { width: number; height: number; heat?: number }): void {
  const fx = new Float64Array(bodies.length);
  const fy = new Float64Array(bodies.length);
  for (let i = 0; i < bodies.length; i += 1) {
    const a = bodies[i]!;
    for (let j = i + 1; j < bodies.length; j += 1) {
      const b = bodies[j]!;
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      if (dx === 0 && dy === 0) [dx, dy] = [(i % 7) - 3 || 1, (j % 5) - 2 || 1];
      const squared = Math.max(CLOSEST, dx * dx + dy * dy);
      const push = REPULSION / squared;
      const length = Math.sqrt(squared);
      fx[i] = (fx[i] ?? 0) + (dx / length) * push;
      fy[i] = (fy[i] ?? 0) + (dy / length) * push;
      fx[j] = (fx[j] ?? 0) - (dx / length) * push;
      fy[j] = (fy[j] ?? 0) - (dy / length) * push;
    }
  }
  for (const [from, to] of links) {
    const [a, b] = [bodies[from], bodies[to]];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    const pull = (length - REST) * PULL;
    fx[from] = (fx[from] ?? 0) + (dx / length) * pull;
    fy[from] = (fy[from] ?? 0) + (dy / length) * pull;
    fx[to] = (fx[to] ?? 0) - (dx / length) * pull;
    fy[to] = (fy[to] ?? 0) - (dy / length) * pull;
  }
  const fastest = FASTEST * heat;
  bodies.forEach((body, index) => {
    body.vx = (body.vx + (fx[index] ?? 0) + (width / 2 - body.x) * GRAVITY) * FRICTION;
    body.vy = (body.vy + (fy[index] ?? 0) + (height / 2 - body.y) * GRAVITY) * FRICTION;
    const speed = Math.hypot(body.vx, body.vy);
    if (speed > fastest) [body.vx, body.vy] = [(body.vx / speed) * fastest, (body.vy / speed) * fastest];
    const [x, y] = [body.x + body.vx, body.y + body.vy];
    body.x = Math.min(width, Math.max(0, x));
    body.y = Math.min(height, Math.max(0, y));
    if (body.x !== x) body.vx = 0;
    if (body.y !== y) body.vy = 0;
  });
}
