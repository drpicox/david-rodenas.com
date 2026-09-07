import { colourise, fractalise, sea, temperatures } from "./filters";
import { emptyWorld, type Filter, type World } from "./World";

/**
 * The pipeline, in the order it was written in 1999: raise the land, work out
 * the climate, decide where the water stops, and only then paint it. Every
 * stage reads what the ones before it decided, so the order is not a style —
 * it is the meaning.
 */
export const PIPELINE: readonly Filter[] = [fractalise, temperatures, sea(), colourise];

export const MAP_WIDTH = 256;
export const MAP_HEIGHT = 128;

export function generateWorld(seed: number, pipeline: readonly Filter[] = PIPELINE): World {
  return pipeline.reduce<World>((world, filter) => filter(world), emptyWorld(seed, MAP_WIDTH, MAP_HEIGHT));
}
