import { icosahedron } from "./icosahedron";
import type { World } from "./World";

/** The world before any filter: the bare icosahedron, nothing decided about it yet. */
export function emptyWorld(seed: number): World {
  const mesh = icosahedron();
  return {
    seed,
    mesh,
    temperature: new Float32Array(mesh.vertexCount),
    faceColour: new Uint8ClampedArray(mesh.faceCount * 3),
    seaRadius: 0,
  };
}
