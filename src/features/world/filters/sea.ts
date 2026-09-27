import type { Filter } from "../World";

/**
 * The sea is a minimum radius. Every corner below it is pushed up to exactly
 * it, so the ocean comes out as a smooth sphere and the land stands on top of
 * it as relief — which is why a coastline reads as a coastline and not as a
 * change of colour.
 */
export const sea =
  (share = 0.55): Filter =>
  (world) => {
    const sorted = Float32Array.from(world.mesh.radii).sort();
    const index = Math.min(sorted.length - 1, Math.floor(sorted.length * share));
    const seaRadius = sorted[index] ?? 1;

    const radii = Float32Array.from(world.mesh.radii, (radius) => Math.max(radius, seaRadius));
    return { ...world, mesh: { ...world.mesh, radii }, seaRadius };
  };
