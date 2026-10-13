import type { Blueprint, PlacedNode } from "./Blueprint";
import { freshId } from "./freshId";
import type { Kit } from "./kitOf";
import type { Literal } from "./NodeKind";
import { withNode } from "./withNode";
import { withValue } from "./withValue";
import { withWire } from "./withWire";

/**
 * The blueprint with an input put on the board: a dial, standing where
 * asked, called as the input is and wired into it, holding what the input
 * held — what was written on it, or what its node chose for it, or what its
 * kind starts it with. What was written on the input is rubbed out: the
 * wire says it now. Says what the dial is called; nothing, for an input
 * that is not there.
 */
export function withDial(blueprint: Blueprint, kit: Kit, id: string, pin: string, settled: Literal | undefined, at: { readonly x: number; readonly y: number }): { readonly blueprint: Blueprint; readonly dial: string } | null {
  const node = blueprint.nodes.find((each) => each.id === id);
  const input = node && kit.kinds.get(node.kind)?.inputs.find((each) => each.name === pin);
  if (!node || !input) return null;
  const value = node.values[pin] ?? settled ?? input.initial ?? (input.type === "number" ? 0 : input.type === "flag" ? false : "");
  const dial: PlacedNode = { id: freshId(blueprint, pin.replace(/[^\w-]/g, "") || "dial"), kind: "dial", x: at.x, y: at.y, title: input.label || pin, values: { value } };
  return { blueprint: withWire(withValue(withNode(blueprint, dial), id, pin, undefined), { from: { node: dial.id, pin: "value" }, to: { node: id, pin } }), dial: dial.id };
}
