import type { Mesh } from "./Mesh";
import type { World } from "./World";

/** A world whose mesh has been replaced, with the fields sized to match. */
export function withMesh(world: World, mesh: Mesh): World {
  return {
    ...world,
    mesh,
    temperature: new Float32Array(mesh.vertexCount),
    faceColour: new Uint8ClampedArray(mesh.faceCount * 3),
  };
}
