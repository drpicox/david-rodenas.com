import type { Blueprint, Wire } from "../../platform/blueprint/Blueprint";
import type { Kit } from "../../platform/blueprint/kitOf";

/** What is asked, and an answer for each conduit that could be run: what it is called, what there is to say of it, and the custom property of its colour. */
export interface Question {
  readonly asked: string;
  readonly choices: readonly { readonly label: string; readonly said: string; readonly colour?: string }[];
}

/**
 * What the display asks when a conduit let go on a module could be run more
 * ways than one, in the words of the blueprint: which input, where only that
 * is open; which of what the module gives, where it gives several; both,
 * where both are. Each answer says what it would take the place of, and is
 * in the colour of what it would carry. The conduits are all between the
 * same two modules, which is how a hand can leave the question open.
 */
export function questionOf(blueprint: Blueprint, kit: Kit, wires: readonly Wire[]): Question {
  const [first] = wires;
  if (!first) return { asked: "", choices: [] };
  const nodeOf = (id: string) => blueprint.nodes.find((node) => node.id === id);
  const kindOf = (id: string) => kit.kinds.get(nodeOf(id)?.kind ?? "");
  const titleOf = (id: string) => nodeOf(id)?.title ?? kindOf(id)?.title ?? nodeOf(id)?.kind ?? id;
  const out = (wire: Wire) => kindOf(wire.from.node)?.outputs.find((pin) => pin.name === wire.from.pin);
  const outSaid = (wire: Wire) => out(wire)?.label || wire.from.pin;
  const intoSaid = (wire: Wire) => kindOf(wire.to.node)?.inputs.find((pin) => pin.name === wire.to.pin)?.label || wire.to.pin;
  const open = { outs: new Set(wires.map((wire) => wire.from.pin)).size > 1, ins: new Set(wires.map((wire) => wire.to.pin)).size > 1 };
  const [from, to] = [titleOf(first.from.node), titleOf(first.to.node)];
  return {
    asked: !open.outs ? `Which input of ${to} does ${from} feed?` : `What of ${from} feeds ${open.ins ? "which input" : intoSaid(first)} of ${to}?`,
    choices: wires.map((wire) => {
      const feeder = blueprint.wires.find((each) => each.to.node === wire.to.node && each.to.pin === wire.to.pin);
      const colour = kit.types.get(out(wire)?.type ?? "")?.colour;
      return {
        label: open.outs && open.ins ? `${outSaid(wire)} → ${intoSaid(wire)}` : open.outs ? outSaid(wire) : intoSaid(wire),
        said: feeder ? `in place of ${titleOf(feeder.from.node)}` : "nothing feeds it yet",
        ...(colour !== undefined && { colour }),
      };
    }),
  };
}
