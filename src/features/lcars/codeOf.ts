import type { PlacedNode } from "../../platform/blueprint/Blueprint";
import type { NodeResult } from "../../platform/blueprint/Evaluation";
import type { Kit } from "../../platform/blueprint/kitOf";
import type { Role } from "../../platform/blueprint/NodeKind";

/** What a module is for, as short as a pad has room for. */
const FOR: Readonly<Record<Role, string>> = { source: "SRC", step: "STEP", statistic: "STAT", paint: "VIEW", dial: "DIAL", note: "NOTE" };
/** No more letters than this fit beside a module's name. */
const ROOM = 5;
/** The first figure in some words: 22 of "22 rows · year, days", −0.41 with its real minus sign. */
const FIGURE = /[−-]?\d+(?:\.\d+)?/;

/**
 * The figure a module's pad carries. An LCARS display is covered in numbers
 * that mean nothing; here each one is real — how many rows the module gave,
 * the number it found, what a dial is set to — read off what the module
 * says came out of it. Where there is no figure, what the module is for;
 * and where it has not answered, that.
 */
export function codeOf(node: PlacedNode, kit: Kit, result: NodeResult | undefined): string {
  const kind = kit.kinds.get(node.kind);
  if (result?.state === "unknown" || !kind) return "???";
  if (result?.state === "failed") return "ERR";
  if (result?.state === "missing") return "---";
  if (result?.state !== "done") return "···";
  if (kind.role === "dial") {
    const set = String(node.values["value"] ?? "");
    return set !== "" && set.length <= ROOM ? set : FOR.dial;
  }
  const given = kind.outputs.flatMap((pin) => (pin.name in result.outputs ? [kit.types.get(pin.type)?.describe(result.outputs[pin.name]) ?? ""] : []));
  for (const words of [...given, result.said]) {
    const figure = FIGURE.exec(words)?.[0];
    if (figure) return figure;
  }
  return FOR[kind.role];
}
