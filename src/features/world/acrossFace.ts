import type { World } from "./World";

/** The mean of a per-vertex field over the three corners of a face. */
export function acrossFace(world: World, field: Float32Array, face: number): number {
  const a = world.mesh.faces[face * 3] ?? 0;
  const b = world.mesh.faces[face * 3 + 1] ?? 0;
  const c = world.mesh.faces[face * 3 + 2] ?? 0;
  return ((field[a] ?? 0) + (field[b] ?? 0) + (field[c] ?? 0)) / 3;
}
