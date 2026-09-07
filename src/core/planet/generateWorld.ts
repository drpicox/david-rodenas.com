import { colourise, fractalise, sea, temperatures } from "./filters";
import { emptyWorld, type Filter, type World } from "./World";

/**
 * The pipeline: start from the solid, fractalise it, put the sea in, work out
 * the climate, and only then paint.
 *
 * Every stage reads what the ones before it decided — the coastline needs the
 * sea, the climate needs the heights and is measured from the sea's level,
 * the paint needs all of it — so the order is not a style. It is the meaning.
 */
export const PIPELINE: readonly Filter[] = [fractalise(), sea(), temperatures(), colourise];

export function generateWorld(seed: number, pipeline: readonly Filter[] = PIPELINE): World {
  return pipeline.reduce<World>((world, filter) => filter(world), emptyWorld(seed));
}
