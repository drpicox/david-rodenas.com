import type { Literal } from "./NodeKind";
import { numberSaid } from "./numberSaid";
import type { Resolved } from "./resolvedEditor";

/** A value as the editor that sets it says it: a station by its name, a commit by its day, yes or no. */
export function saidBy(editor: Resolved, value: Literal): string {
  if (editor.kind === "choice") return editor.choices.find((choice) => choice.value === String(value))?.label ?? String(value);
  if (editor.kind === "number") return editor.show ? editor.show(Number(value)) : numberSaid(Number(value));
  if (editor.kind === "flag") return value === true ? "yes" : "no";
  return String(value);
}
