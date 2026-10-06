import type { PlacedNode } from "./Blueprint";
import type { Evaluation } from "./Evaluation";
import type { Kit } from "./kitOf";
import type { Choice, Editor, InputPin } from "./NodeKind";
import type { Table } from "./Table";

/** How an input is written by hand, once nothing is left to find out. A column becomes a choice among the columns the node was handed, and a value of one a choice, a range, or words. */
export type Resolved = Exclude<Editor, { readonly kind: "column" } | { readonly kind: "values" }>;

/** No more values than this are offered as a list: more, and words are written instead. */
const MOST_VALUES = 40;
/** The tests that compare a number with one value: a range is offered to choose it in. */
const COMPARING = new Set(["below", "at-most", "above", "at-least"]);
/** The tests that ask for one value: the column's own values are offered. */
const ONE_OF = new Set(["equals", "differs"]);

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
 * handed where it is a column, the values of one where a filter asks for one
 * — or, where that is not known yet, whatever is written there already. An
 * input with nothing to say how is written as words, a number, or yes and no,
 * as its type takes.
 */
/** One value of a column, as a filter asks for it: from the column's own values, in its range, or as words. */
function valuesEditor(node: PlacedNode, editor: Extract<Editor, { kind: "values" }>, kit: Kit, evaluation: Evaluation | undefined): Resolved {
  const table = tableHanded(node, editor.of, kit, evaluation);
  const result = evaluation?.get(node.id);
  const kind = kit.kinds.get(node.kind);
  const named = node.values[editor.column] ?? (result?.state === "done" ? result.settled[editor.column] : undefined);
  const column = table?.columns.find((each) => each.name === named);
  const test = String(node.values[editor.test] ?? kind?.inputs.find((input) => input.name === editor.test)?.initial ?? "");
  if (!table || !column) return { kind: "text" };
  const cells = table.rows.map((row) => row[column.name]).filter((cell) => cell !== null && cell !== undefined && cell !== "");
  if (COMPARING.has(test) && column.kind === "number") {
    const numbers = cells as number[];
    const whole = numbers.every(Number.isInteger);
    return numbers.length === 0 ? { kind: "number" } : { kind: "number", min: Math.floor(Math.min(...numbers)), max: Math.ceil(Math.max(...numbers)), step: whole ? 1 : Number(((Math.max(...numbers) - Math.min(...numbers)) / 100).toPrecision(1)) || 1 };
  }
  const distinct = [...new Set(cells.map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (ONE_OF.has(test) && distinct.length > 0 && distinct.length <= MOST_VALUES) return { kind: "choice", choices: distinct.map((value) => ({ value, label: value })) };
  return { kind: "text" };
}

export function resolvedEditor(node: PlacedNode, pin: InputPin, kit: Kit, read: (path: string) => string, evaluation?: Evaluation): Resolved {
  let editor: Editor | undefined;
  try {
    editor = typeof pin.editor === "function" ? pin.editor(read) : pin.editor;
  } catch {
    editor = undefined;
  }
  if (editor?.kind === "values") return valuesEditor(node, editor, kit, evaluation);
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
