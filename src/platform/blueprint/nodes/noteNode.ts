import type { NodeKind } from "../NodeKind";

/** Words standing on the canvas, for whoever reads the blueprint next: what it is for, what to try. Nothing flows through it. */
export const noteNode: NodeKind = {
  name: "note",
  title: "Note",
  role: "note",
  shelf: "Notes",
  summary: "Words on the canvas, for whoever reads the blueprint next.",
  inputs: [{ name: "text", label: "", type: "text", initial: "", editor: { kind: "text", lines: 4 } }],
  outputs: [],
  run: () => ({ said: "" }),
};
