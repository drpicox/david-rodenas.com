import { colourise } from "./filters/colourise";
import { fractalise } from "./filters/fractalise";
import { sea } from "./filters/sea";
import { temperatures } from "./filters/temperatures";
import type { Filter } from "./World";

/**
 * The pipeline: start from the solid, fractalise it, put the sea in, work out
 * the climate, and only then paint.
 *
 * Every stage reads what the ones before it decided — the coastline needs the
 * sea, the climate needs the heights and is measured from the sea's level,
 * the paint needs all of it — so the order is not a style. It is the meaning.
 */
export const PIPELINE: readonly Filter[] = [fractalise(), sea(), temperatures(), colourise];
