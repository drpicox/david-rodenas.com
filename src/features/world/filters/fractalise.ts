import { randomOf } from "../../../platform/random/randomOf";
import { subdivide } from "../subdivide";
import { withMesh } from "../withMesh";
import type { Filter } from "../World";

/**
 * Split every edge and push the new midpoint along its own radius, by a
 * fraction of the length of the edge it came from.
 *
 * Tying the displacement to the edge length is the whole trick: edges halve at
 * every level, so the first rounds carve continents and the last ones only
 * roughen a slope. `roughness` is the one dial — 0.1 was the original default.
 *
 * The surface type rides along, as in `FractalRadialTexturat`: the corners of
 * the icosahedron get a random one, and each midpoint takes a blend of its
 * two ends nudged by chance and by how different the ends are.
 */
export const fractalise =
  (levels = 4, roughness = 0.28, textureRoughness = 0.2): Filter =>
  (world) => {
    const random = randomOf(world.seed);
    let mesh = world.mesh;
    const surface = Float32Array.from(mesh.surface, () => random());
    mesh = { ...mesh, surface };
    for (let level = 0; level < levels; level += 1) {
      mesh = subdivide(
        mesh,
        (length) => length * roughness * (random() - 0.5),
        (a, b) => {
          const proportion = 0.5 + (random() - 0.5) * (a - b) * textureRoughness;
          return Math.min(1, Math.max(0, a * (1 - proportion) + b * proportion));
        },
      );
    }
    return withMesh(world, mesh);
  };
