import type { Feature } from "../../platform/plugin/Feature";
import { crossNode } from "./nodes/crossNode";
import { dayPartsNode } from "./nodes/dayPartsNode";

/**
 * A trial David asked for: whether a blueprint is easier to make with a few
 * bigger nodes — two sources crossed, two times of a day compared, each one
 * node — than with the small ones they stand for. They are offered only to a
 * reader who switches the flag on (`flags recipes on`, or `?recipes=on`);
 * they run for everyone, so a blueprint that names them works either way.
 */
export const recipesFeature: Feature = {
  name: "recipes",
  flags: [{ name: "recipes", description: "bigger nodes in the blueprints: two sources crossed, two times of a day compared, each one node" }],
  nodes: [crossNode, dayPartsNode],
};
