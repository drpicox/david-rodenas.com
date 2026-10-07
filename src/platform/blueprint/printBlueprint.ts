import type { Blueprint, PinRef } from "./Blueprint";
import type { Kit } from "./kitOf";
import type { Literal } from "./NodeKind";

const BARE = /^[^\s"#@=:]+$/;
const NUMERIC = /^-?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

const quoted = (text: string) => `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;

/**
 * A blueprint as text, the way `parseBlueprint` reads it: one node a line,
 * named only when a wire comes from it, each input written or wired in the
 * order its kind has them, and where it stands unless that is not wanted —
 * text a person writes on a page leaves it to the tidying.
 */
export function printBlueprint(blueprint: Blueprint, kit: Kit, { positions = true }: { readonly positions?: boolean } = {}): string {
  const ids = new Set(blueprint.nodes.map((node) => node.id));
  const sources = new Set(blueprint.wires.map((wire) => wire.from.node));
  const kindOfId = new Map(blueprint.nodes.map((node) => [node.id, kit.kinds.get(node.kind)]));
  // Into an input that names a column, or holds words of its own, a bare name is read as those words: the wire names its output.
  const reference = ({ node, pin }: PinRef, named: boolean) => (kindOfId.get(node)?.outputs[0]?.name === pin && !named ? node : `${node}.${pin}`);
  // A word is written bare unless it would be read back as something else: a wire, a number, an input's name, a comment.
  const literal = (value: Literal, type: string | undefined): string => {
    if (typeof value === "boolean") return value ? "yes" : "no";
    if (typeof value === "number") return String(value);
    const ambiguous = !BARE.test(value) || ids.has(value) || ids.has(value.split(".")[0] ?? "") || (type !== "text" && NUMERIC.test(value));
    return ambiguous ? quoted(value) : value;
  };

  return blueprint.nodes
    .map((node) => {
      const kind = kit.kinds.get(node.kind);
      const into = new Map(blueprint.wires.filter((wire) => wire.to.node === node.id).map((wire) => [wire.to.pin, wire.from]));
      const pins = kind ? kind.inputs.map((pin) => pin.name) : [...new Set([...Object.keys(node.values), ...into.keys()])];
      const typeOf = new Map(kind?.inputs.map((pin) => [pin.name, pin.type]));
      const named = new Set(kind?.inputs.filter((pin) => typeof pin.editor === "object" && (pin.editor.kind === "column" || pin.editor.kind === "text")).map((pin) => pin.name));
      const written = pins.flatMap((pin) => {
        const from = into.get(pin);
        if (from) return [`${pin}: ${reference(from, named.has(pin))}`];
        const value = node.values[pin];
        return value === undefined ? [] : [`${pin}: ${literal(value, typeOf.get(pin))}`];
      });
      return [
        sources.has(node.id) ? `${node.id} =` : "",
        node.kind,
        node.title !== undefined ? quoted(node.title) : "",
        ...written,
        positions ? `@ ${Math.round(node.x)} ${Math.round(node.y)}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join("\n");
}
