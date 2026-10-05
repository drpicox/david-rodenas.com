import type { Point } from "./nodeShapeOf";

/** However close two pins are, a wire leaves and arrives level for at least this long, so it reads as leaving and arriving. */
const LEAST = 60;

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * A wire as Unreal draws one: out of its output to the right, into its input
 * from the left, and a smooth bend between. Pulled out as far as half the way
 * across, so a long wire is a gentle S and a short one still leaves level.
 */
export function wirePath(from: Point, to: Point): string {
  const reach = Math.max(LEAST, Math.abs(to.x - from.x) / 2);
  return `M${round(from.x)} ${round(from.y)} C${round(from.x + reach)} ${round(from.y)} ${round(to.x - reach)} ${round(to.y)} ${round(to.x)} ${round(to.y)}`;
}
