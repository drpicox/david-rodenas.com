import type { SphereOptions } from "./SphereOptions";
import { SphereRaster } from "./SphereRaster";
import type { World } from "./World";

/**
 * Paints the world onto a square RGBA buffer, once.
 *
 * This is the form for whoever paints a world and is done with it — a tool
 * writing a PNG, a test asking a question. Anything that paints the same size
 * again and again wants a `SphereRaster` instead, which keeps its buffers.
 */
export function renderSphere(world: World, size: number, options: SphereOptions): Uint8ClampedArray {
  return new SphereRaster(size).paint(world, options);
}
