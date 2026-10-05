import type { Blueprint, PinRef } from "./Blueprint";
import type { Evaluation } from "./Evaluation";
import type { Kit } from "./kitOf";
import type { Literal } from "./NodeKind";
import { type Resolved, resolvedEditor } from "./resolvedEditor";
import { saidBy } from "./saidBy";

/** A dial on the board: what it is called, what it holds, how it is turned, and what it holds said as a reader would say it. */
export interface Dial {
  readonly node: string;
  readonly label: string;
  readonly value: Literal;
  readonly editor: Resolved;
  readonly said: string;
  /** The inputs it is wired into. */
  readonly targets: readonly PinRef[];
}

/**
 * The dials of a blueprint, as the board shows them, in the order the
 * blueprint's text has them. A dial is turned the way the first input it is
 * wired into is written: a slider for a range, a list for a choice; it is
 * called what it is titled, or else what that input is called.
 */
export function dialsOf(blueprint: Blueprint, kit: Kit, read: (path: string) => string, evaluation?: Evaluation): Dial[] {
  const byId = new Map(blueprint.nodes.map((node) => [node.id, node]));
  return blueprint.nodes
    .filter((node) => kit.kinds.get(node.kind)?.role === "dial")
    .map((node) => {
      const targets = blueprint.wires.filter((wire) => wire.from.node === node.id).map((wire) => wire.to);
      const first = targets[0];
      const target = first && byId.get(first.node);
      const pin = target && kit.kinds.get(target.kind)?.inputs.find((input) => input.name === first.pin);
      const editor: Resolved = target && pin ? resolvedEditor(target, pin, kit, read, evaluation) : { kind: "text" };
      const value = node.values["value"] ?? 0;
      return { node: node.id, label: node.title ?? pin?.label ?? "dial", value, editor, said: saidBy(editor, value), targets };
    });
}
