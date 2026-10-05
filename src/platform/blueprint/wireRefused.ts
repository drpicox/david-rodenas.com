import type { Blueprint, Wire } from "./Blueprint";
import { fits } from "./fits";
import type { Kit } from "./kitOf";

/** Whether one node already needs another, by any road of wires. */
function needs(blueprint: Blueprint, node: string, other: string): boolean {
  const seen = new Set<string>();
  const roads = [node];
  for (let at = roads.pop(); at !== undefined; at = roads.pop()) {
    if (at === other) return true;
    if (seen.has(at)) continue;
    seen.add(at);
    for (const wire of blueprint.wires) if (wire.to.node === at) roads.push(wire.from.node);
  }
  return false;
}

/**
 * Why a wire cannot be drawn, in words, or nothing when it can: what flows
 * out does not fit what goes in, a node would feed itself, or the wire would
 * close a circle, where no node could run before the others.
 */
export function wireRefused(blueprint: Blueprint, kit: Kit, wire: Wire): string | null {
  if (wire.from.node === wire.to.node) return "a node cannot feed itself";
  const kindOf = (id: string) => kit.kinds.get(blueprint.nodes.find((node) => node.id === id)?.kind ?? "");
  const out = kindOf(wire.from.node)?.outputs.find((pin) => pin.name === wire.from.pin);
  const into = kindOf(wire.to.node)?.inputs.find((pin) => pin.name === wire.to.pin);
  if (!out || !into) return "there is no such pin";
  const label = (type: string) => kit.types.get(type)?.label ?? type;
  if (!fits(kit, out.type, into.type)) return `${label(out.type)} cannot go into ${into.label}, which takes ${label(into.type)}`;
  if (needs(blueprint, wire.from.node, wire.to.node)) return `that would make a circle: ${wire.from.node} needs ${wire.to.node} already`;
  return null;
}
