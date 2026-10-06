import type { Blueprint } from "../blueprint/Blueprint";
import type { Kit } from "../blueprint/kitOf";
import { nodeShapeOf } from "../blueprint/nodeShapeOf";
import type { Box } from "./Camera";

/** The rectangle every node of a blueprint stands in; nothing, for a blueprint with no nodes. */
export function boundsOf(blueprint: Blueprint, kit: Kit): Box | null {
  if (blueprint.nodes.length === 0) return null;
  const left = Math.min(...blueprint.nodes.map((node) => node.x));
  const top = Math.min(...blueprint.nodes.map((node) => node.y));
  const shapes = blueprint.nodes.map((node) => nodeShapeOf(kit.kinds.get(node.kind)));
  const right = Math.max(...blueprint.nodes.map((node, at) => node.x + (shapes[at]?.width ?? 0)));
  const bottom = Math.max(...blueprint.nodes.map((node, at) => node.y + (shapes[at]?.height ?? 0)));
  return { x: left, y: top, width: right - left, height: bottom - top };
}
