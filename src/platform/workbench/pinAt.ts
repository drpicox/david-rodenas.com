import type { Blueprint } from "../blueprint/Blueprint";
import type { Kit } from "../blueprint/kitOf";
import { nodeShapeOf } from "../blueprint/nodeShapeOf";

/** A pin found under a point: its node, its name, and which side it is on. */
export interface PinFound {
  readonly node: string;
  readonly pin: string;
  readonly side: "input" | "output";
}

/**
 * The pin nearest a point of the blueprint, if one is within reach: where a
 * wire being dragged is let go. Found from where pins are drawn, not from
 * what is under the pointer on the screen, so a wire dropped a little off a
 * pin still finds it, and a node being drawn over another does not hide it.
 */
export function pinAt(blueprint: Blueprint, kit: Kit, point: { readonly x: number; readonly y: number }, reach = 14): PinFound | null {
  let best: PinFound | null = null;
  let nearest = reach;
  for (const node of blueprint.nodes) {
    const shape = nodeShapeOf(kit.kinds.get(node.kind));
    for (const [side, pins] of [["input", shape.inputs], ["output", shape.outputs]] as const)
      for (const [pin, at] of pins) {
        const distance = Math.hypot(node.x + at.x - point.x, node.y + at.y - point.y);
        if (distance <= nearest) {
          nearest = distance;
          best = { node: node.id, pin, side };
        }
      }
  }
  return best;
}
