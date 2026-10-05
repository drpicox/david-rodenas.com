import type { PlacedNode } from "./Blueprint";
import type { Evaluation } from "./Evaluation";
import type { Kit } from "./kitOf";
import type { Choice, Editor, InputPin } from "./NodeKind";
import type { Table } from "./Table";

/** How an input is written by hand, once nothing is left to find out. A column becomes a choice among the columns the node was handed. */
export type Resolved = Exclude<Editor, { readonly kind: "column" }>;

/** The table an input of a node was handed, whatever came along the wire: a graph is the table of its files. */
function tableHanded(node: PlacedNode, of: string, kit: Kit, evaluation: Evaluation | undefined): Table | undefined {
  const result = evaluation?.get(node.id);
  if (result?.state !== "done" && result?.state !== "failed") return undefined;
  const pin = kit.kinds.get(node.kind)?.inputs.find((input) => input.name === of);
  const value = result.inputs[of];
  if (!pin || value === undefined) return undefined;
  return (pin.type === "table" ? value : kit.types.get(pin.type)?.becomes?.["table"]?.(value)) as Table | undefined;
}

/**
 * How one input of one node is written by hand, worked out: a range read
 * from the data where it depends on it, the columns of the table the node was
 * handed where it is a column — or, where that is not known yet, whatever is
 * written there already. An input with nothing to say how is written as
 * words, a number, or yes and no, as its type takes.
 */
export function resolvedEditor(node: PlacedNode, pin: InputPin, kit: Kit, read: (path: string) => string, evaluation?: Evaluation): Resolved {
  let editor: Editor | undefined;
  try {
    editor = typeof pin.editor === "function" ? pin.editor(read) : pin.editor;
  } catch {
    editor = undefined;
  }
  if (editor?.kind === "column") {
    const table = tableHanded(node, editor.of, kit, evaluation);
    const columns = (table?.columns ?? []).filter((column) => !editor.numeric || column.kind === "number");
    const written = node.values[pin.name];
    const choices: Choice[] = columns.map((column) => ({ value: column.name, label: column.name }));
    if (typeof written === "string" && !choices.some((choice) => choice.value === written)) choices.push({ value: written, label: written });
    return { kind: "choice", choices };
  }
  if (editor) return editor;
  if (pin.type === "number") return { kind: "number" };
  if (pin.type === "flag") return { kind: "flag" };
  return { kind: "text" };
}
