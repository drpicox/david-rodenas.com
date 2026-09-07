import { colourise, fractalise, sea, temperatures } from "./filters";
import { emptyWorld, type Filter, type World } from "./World";

/**
 * The pipeline, in the order it was written in 1999: start from the solid,
 * raise the land, work out the climate, decide where the water stops, and
 * only then paint it. Every stage reads what the ones before it decided, so
 * the order is not a style — it is the meaning.
 *
 * The icosahedron is not a filter here because it is what a world is made of
 * rather than something done to it; it arrives with `emptyWorld`.
 */
export const PIPELINE: readonly Filter[] = [fractalise, temperatures, sea(), colourise];

/**
 * Two subdivisions is 320 triangles: few enough that you can count them and
 * the planet reads as something that was built, many enough to hold a
 * coastline. It is a decision, and it is meant to be visible.
 */
export const SUBDIVISIONS = 2;

export function generateWorld(
  seed: number,
  pipeline: readonly Filter[] = PIPELINE,
  subdivisions: number = SUBDIVISIONS,
): World {
  return pipeline.reduce<World>((world, filter) => filter(world), emptyWorld(seed, subdivisions));
}
