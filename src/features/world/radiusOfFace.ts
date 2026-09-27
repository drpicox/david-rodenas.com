import { acrossFace } from "./acrossFace";
import type { World } from "./World";

/** The mean radius of the three corners of a face. */
export function radiusOfFace(world: World, face: number): number {
  return acrossFace(world, world.mesh.radii, face);
}
