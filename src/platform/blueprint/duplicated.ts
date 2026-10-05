import type { Blueprint, PlacedNode } from "./Blueprint";
import { freshId } from "./freshId";

/** Some nodes copied a little down and to the right of themselves, the wires between them copied too, under names of their own; and those names. */
export function duplicated(blueprint: Blueprint, ids: readonly string[], offset: number): { blueprint: Blueprint; ids: string[] } {
  const renamed = new Map<string, string>();
  let next = blueprint;
  for (const node of blueprint.nodes.filter((each) => ids.includes(each.id))) {
    const id = freshId(next, node.kind);
    renamed.set(node.id, id);
    const copy: PlacedNode = { ...node, id, x: node.x + offset, y: node.y + offset };
    next = { ...next, nodes: [...next.nodes, copy] };
  }
  const inside = blueprint.wires.filter(({ from, to }) => renamed.has(from.node) && renamed.has(to.node));
  const copied = inside.map(({ from, to }) => ({ from: { ...from, node: renamed.get(from.node) ?? from.node }, to: { ...to, node: renamed.get(to.node) ?? to.node } }));
  return { blueprint: { ...next, wires: [...next.wires, ...copied] }, ids: [...renamed.values()] };
}
