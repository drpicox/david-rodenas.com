import { colourise, fractalise, sea, temperatures } from "./filters";
import { generateWorld } from "./generateWorld";
import type { World } from "./World";
import type { WorldRecipe } from "./WorldRecipe";

/** The pipeline, in its order, with the dials set from a recipe. */
export function growWorld(recipe: WorldRecipe): World {
  return generateWorld(recipe.seed, [fractalise(recipe.levels, recipe.roughness), sea(recipe.share), temperatures(), colourise]);
}
