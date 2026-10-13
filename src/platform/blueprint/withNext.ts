import type { Blueprint, PlacedNode } from "./Blueprint";
import { freshId } from "./freshId";
import type { Suggestion } from "./suggestionsFor";
import { withNode } from "./withNode";
import { withWire } from "./withWire";

/**
 * The blueprint with a next step taken: the node offered, standing where
 * asked, written as offered and wired from the node it follows — and from
 * the other one too, where it is a join. Says what the new node is called,
 * so that whoever took the step can choose it, and be offered what comes
 * after it in turn.
 */
export function withNext(blueprint: Blueprint, after: string, offer: Suggestion, at: { readonly x: number; readonly y: number }): { readonly blueprint: Blueprint; readonly added: string } {
  const node: PlacedNode = { id: freshId(blueprint, offer.kind), kind: offer.kind, x: at.x, y: at.y, values: offer.values };
  const wired = withWire(withNode(blueprint, node), { from: { node: after, pin: offer.from }, to: { node: node.id, pin: offer.into } });
  return { blueprint: offer.also ? withWire(wired, { from: offer.also.from, to: { node: node.id, pin: offer.also.into } }) : wired, added: node.id };
}
