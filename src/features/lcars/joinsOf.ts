import type { Blueprint, Wire } from "../../platform/blueprint/Blueprint";
import type { Kit } from "../../platform/blueprint/kitOf";
import { wireRefused } from "../../platform/blueprint/wireRefused";

/** One end of a conduit to be run: the module, and its pin where the hand said which. */
export interface JoinEnd {
  readonly node: string;
  readonly pin?: string;
}

export interface Joins {
  /** Every conduit that could be run, the ends being what they are. */
  readonly wires: readonly Wire[];
  /** The one to run without asking: the only one there is, or the only one into an input nothing feeds yet. */
  readonly plain: Wire | null;
  /** Why none can be, in words; nothing when one can. */
  readonly refused: string | null;
}

/**
 * The conduits that could be run from one module into another, on a display
 * where a hand says the two modules and not always the pins: a module shows
 * a port only for what is wired, so what is let go on a module is let go on
 * all of its inputs at once. Every pair of an output and an input that a
 * wire may join is one — but not the conduit already there. Where there is
 * only one, or only one into an input nothing feeds yet, it is run without
 * asking; where there are several, which is asked. Where there is none, why
 * not is said in the words a wire is refused in.
 */
export function joinsOf(blueprint: Blueprint, kit: Kit, from: JoinEnd, to: JoinEnd): Joins {
  const nodeOf = (id: string) => blueprint.nodes.find((node) => node.id === id);
  const kindOf = (id: string) => kit.kinds.get(nodeOf(id)?.kind ?? "");
  const none = (refused: string): Joins => ({ wires: [], plain: null, refused });
  for (const end of [from, to]) if (!kindOf(end.node)) return none(`there is no kind of node called ${nodeOf(end.node)?.kind ?? end.node}`);
  const outs = from.pin === undefined ? (kindOf(from.node)?.outputs ?? []).map((pin) => pin.name) : [from.pin];
  const ins = to.pin === undefined ? (kindOf(to.node)?.inputs ?? []).map((pin) => pin.name) : [to.pin];
  if (outs.length === 0) return none(`${kindOf(from.node)?.title} gives nothing to run a conduit from`);
  if (ins.length === 0) return none(`${kindOf(to.node)?.title} takes nothing`);

  const all = outs.flatMap((out) => ins.map((into): Wire => ({ from: { node: from.node, pin: out }, to: { node: to.node, pin: into } })));
  const refusals = all.map((wire) => wireRefused(blueprint, kit, wire));
  const fed = (wire: Wire) => blueprint.wires.find((each) => each.to.node === wire.to.node && each.to.pin === wire.to.pin);
  const there = (wire: Wire) => fed(wire)?.from.node === wire.from.node && fed(wire)?.from.pin === wire.from.pin;
  const fitting = all.filter((_, at) => refusals[at] === null);
  const wires = fitting.filter((wire) => !there(wire));
  if (wires.length === 0) return none(fitting.length > 0 ? "it feeds it there already" : (refusals[0] ?? "nothing fits"));
  const free = wires.filter((wire) => !fed(wire));
  return { wires, plain: wires.length === 1 ? (wires[0] ?? null) : free.length === 1 ? (free[0] ?? null) : null, refused: null };
}
