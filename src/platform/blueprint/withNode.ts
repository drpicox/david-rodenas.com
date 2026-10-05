import type { Blueprint, PlacedNode } from "./Blueprint";

/** The blueprint with one more node, last, so it is drawn over the rest. */
export function withNode(blueprint: Blueprint, node: PlacedNode): Blueprint {
  return { ...blueprint, nodes: [...blueprint.nodes, node] };
}
