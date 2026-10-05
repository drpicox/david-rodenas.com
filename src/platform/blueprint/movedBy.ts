import type { Blueprint } from "./Blueprint";

/** Some nodes moved by the same amount, as a hand drags them together. */
export function movedBy(blueprint: Blueprint, ids: readonly string[], dx: number, dy: number): Blueprint {
  const moving = new Set(ids);
  return { ...blueprint, nodes: blueprint.nodes.map((node) => (moving.has(node.id) ? { ...node, x: node.x + dx, y: node.y + dy } : node)) };
}
