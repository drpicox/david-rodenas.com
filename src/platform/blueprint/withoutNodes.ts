import type { Blueprint } from "./Blueprint";

/** The blueprint without some nodes, and without every wire that came to or from them: a wire with an end in the air is no wire. */
export function withoutNodes(blueprint: Blueprint, ids: readonly string[]): Blueprint {
  const gone = new Set(ids);
  return {
    nodes: blueprint.nodes.filter((node) => !gone.has(node.id)),
    wires: blueprint.wires.filter(({ from, to }) => !gone.has(from.node) && !gone.has(to.node)),
  };
}
