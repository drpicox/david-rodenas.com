import { emptyWorld } from "./emptyWorld";
import { PIPELINE } from "./PIPELINE";
import type { Filter, World } from "./World";

/** A world grown from a seed, through every filter of a pipeline in turn. */
export function generateWorld(seed: number, pipeline: readonly Filter[] = PIPELINE): World {
  return pipeline.reduce<World>((world, filter) => filter(world), emptyWorld(seed));
}
