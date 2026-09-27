import type { World } from "./World";

/** How far north or south a vertex is: 0 at the equator, 1 at the poles. */
export function latitudeOfVertex(world: World, vertex: number): number {
  return Math.abs(world.mesh.directions[vertex * 3 + 1] ?? 0);
}
