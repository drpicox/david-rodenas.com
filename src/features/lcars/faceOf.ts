import type { Blueprint, PlacedNode, Wire } from "../../platform/blueprint/Blueprint";
import type { Evaluation } from "../../platform/blueprint/Evaluation";
import type { Kit } from "../../platform/blueprint/kitOf";
import { resolvedEditor } from "../../platform/blueprint/resolvedEditor";
import { saidBy } from "../../platform/blueprint/saidBy";
import { codeOf } from "./codeOf";

/** Where a conduit meets a module: the pin it is, what the port says, and the custom property it is coloured in. */
export interface Port {
  readonly pin: string;
  readonly said: string;
  readonly colour: string;
  /** What it says is the module's figure, and not what the pin is called. */
  readonly figure?: true;
}

/** An input no wire brings: what it is called, what it holds, and whether a hand wrote that, the module chose it, or it is still lacking. */
export interface Told {
  readonly label: string;
  readonly value: string;
  readonly how: "written" | "settled" | "missing";
}

export interface Face {
  /** The wired inputs, in the order the kind has them: where conduits arrive. */
  readonly ins: readonly Port[];
  /** Where conduits leave. */
  readonly outs: readonly Port[];
  readonly rows: readonly Told[];
}

/**
 * The face a module shows on the schematic, read from left to right as the
 * data flows: what comes into it, what it is, what leaves it. Every wired
 * input is a port called as the input is, in the colour of what arrives
 * there, so a conduit joins two blocks of its own colour and it is seen
 * which input it feeds. A kind that gives one thing has one port out, which
 * carries its figure; one that gives several says which output each conduit
 * leaves from. And what no wire brings is said under the module: what a hand
 * wrote on an input, what the module chose where it was left to it, what it
 * still lacks — but not what merely starts as its kind says.
 */
export function faceOf(node: PlacedNode, blueprint: Blueprint, kit: Kit, evaluation: Evaluation, read: (path: string) => string): Face {
  const kind = kit.kinds.get(node.kind);
  const result = evaluation.get(node.id);
  const colourOf = (type: string | undefined) => kit.types.get(type ?? "")?.colour ?? "--dim";
  /** The colour of what a wire carries: what the output it comes from gives, whatever the input makes of it. */
  const carried = (wire: Wire | undefined) => {
    const from = blueprint.nodes.find((each) => each.id === wire?.from.node);
    return colourOf(kit.kinds.get(from?.kind ?? "")?.outputs.find((pin) => pin.name === wire?.from.pin)?.type);
  };
  const into = new Map(blueprint.wires.filter((wire) => wire.to.node === node.id).map((wire) => [wire.to.pin, wire]));
  const leaving = [...new Set(blueprint.wires.filter((wire) => wire.from.node === node.id).map((wire) => wire.from.pin))];
  const figure = codeOf(node, kit, result);
  if (!kind) return { ins: [...into].map(([pin, wire]) => ({ pin, said: pin, colour: carried(wire) })), outs: leaving.map((pin) => ({ pin, said: figure, colour: "--dim", figure: true })), rows: [] };

  const ins = kind.inputs.filter((pin) => into.has(pin.name)).map((pin) => ({ pin: pin.name, said: pin.label || pin.name, colour: carried(into.get(pin.name)) }));
  const [first] = kind.outputs;
  const named = kind.outputs.filter((pin) => leaving.includes(pin.name)).map((pin) => ({ pin: pin.name, said: pin.label || pin.name, colour: colourOf(pin.type) }));
  const outs: Port[] = !first ? [] : kind.outputs.length > 1 && named.length > 0 ? named : [{ pin: first.name, said: figure, colour: colourOf(first.type), figure: true }];
  const settled = result?.state === "done" ? result.settled : {};
  // A dial holds one thing, and its port out says it.
  const rows = (kind.role === "dial" ? [] : kind.inputs).flatMap((pin): Told[] => {
    if (into.has(pin.name)) return [];
    const [label, written, chosen] = [pin.label || pin.name, node.values[pin.name], settled[pin.name]];
    if (written !== undefined) return [{ label, value: saidBy(resolvedEditor(node, pin, kit, read, evaluation), written), how: "written" }];
    if (chosen !== undefined) return [{ label, value: String(chosen), how: "settled" }];
    return pin.initial === undefined && !pin.optional ? [{ label, value: "—", how: "missing" }] : [];
  });
  return { ins, outs, rows };
}
