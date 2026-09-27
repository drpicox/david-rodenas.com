import type { Body } from "./Body";

/** Stiff enough to arrive in about half a second, loose enough to overshoot by a few per cent. */
const STIFFNESS = 90;
const DAMPING = 15;

/**
 * One frame of a ball flying to its place on a damped spring, a little less
 * damped than would stop it dead: it arrives with a small overshoot and
 * settles, which reads as thrown into place rather than slid there.
 */
export function springTowards(body: Body, x: number, y: number, seconds: number): void {
  const dt = Math.min(seconds, 1 / 30);
  body.vx += ((x - body.x) * STIFFNESS - body.vx * DAMPING) * dt;
  body.vy += ((y - body.y) * STIFFNESS - body.vy * DAMPING) * dt;
  body.x += body.vx * dt;
  body.y += body.vy * dt;
}
