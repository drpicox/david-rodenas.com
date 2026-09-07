import { colourise, fractalise, sea, temperatures } from "./filters";
import { emptyWorld, type Filter, type World } from "./World";

/**
 * The pipeline, in the order the 1999 program ran it: start from the solid,
 * fractalise it, work out the climate, put the sea in, and only then paint.
 *
 * Every stage reads what the ones before it decided — the climate needs the
 * heights, the coastline needs the sea, the paint needs both — so the order is
 * not a style. It is the meaning.
 */
export const PIPELINE: readonly Filter[] = [fractalise(), temperatures(), sea(), colourise];

export function generateWorld(seed: number, pipeline: readonly Filter[] = PIPELINE): World {
  return pipeline.reduce<World>((world, filter) => filter(world), emptyWorld(seed));
}
