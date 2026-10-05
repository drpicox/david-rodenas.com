import { fits } from "../blueprint/fits";
import type { Kit } from "../blueprint/kitOf";
import type { NodeKind } from "../blueprint/NodeKind";

/** A kind of node the menu offers, and the pin a wire being dragged would go into, if one is. */
export interface Offer {
  readonly kind: NodeKind;
  readonly pin?: string;
}

/** What a wire being dragged carries, and from which end: dragged out of an output, it wants an input; out of an input, an output. */
export interface Dragged {
  readonly type: string;
  readonly side: "output" | "input";
}

/**
 * The kinds of node the menu offers: those whose title, name, shelf or line
 * have every word typed; and, when a wire is being dragged, only those it
 * could be wired into, each with the pin it would go to — so a wire pulled
 * out into empty space asks what comes next, and offers only what can.
 * Titles that begin with what was typed come first.
 */
export function kindsFor(kit: Kit, query: string, dragged?: Dragged): Offer[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const offers = [...kit.kinds.values()].flatMap((kind): Offer[] => {
    const text = `${kind.title} ${kind.name} ${kind.shelf} ${kind.summary}`.toLowerCase();
    if (!words.every((word) => text.includes(word))) return [];
    if (!dragged) return [{ kind }];
    // A dial is turned by hand: nothing is wired into it.
    if (dragged.side === "output" && kind.role === "dial") return [];
    const pin = dragged.side === "output" ? kind.inputs.find((input) => fits(kit, dragged.type, input.type)) : kind.outputs.find((output) => fits(kit, output.type, dragged.type));
    return pin ? [{ kind, pin: pin.name }] : [];
  });
  const first = words.join(" ");
  const rank = (offer: Offer) => (first === "" ? 1 : offer.kind.title.toLowerCase().startsWith(first) ? 0 : 1);
  return offers.map((offer, at) => ({ offer, at })).sort((a, b) => rank(a.offer) - rank(b.offer) || a.at - b.at).map(({ offer }) => offer);
}
