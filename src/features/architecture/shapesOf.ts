import type { HistoryRead } from "./readHistory";
import { type Shape, shapeOf } from "./shapeOf";

const kept = new WeakMap<HistoryRead, Shape[]>();

/** The shape of the source at every commit of the history, as the ratchet measures it now: worked out once for a history, however often a page asks. */
export function shapesOf(read: HistoryRead): Shape[] {
  const known = kept.get(read);
  if (known) return known;
  const shapes = read.snapshots.map(shapeOf);
  kept.set(read, shapes);
  return shapes;
}
