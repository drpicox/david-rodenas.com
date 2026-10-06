import { NODE } from "./NODE";
import type { InputPin, NodeKind } from "./NodeKind";

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A node's size, where each of its pins is from its corner, and how many rows each input takes. */
export interface NodeShape {
  readonly width: number;
  readonly height: number;
  readonly inputs: ReadonlyMap<string, Point>;
  readonly outputs: ReadonlyMap<string, Point>;
  readonly rows: ReadonlyMap<string, number>;
}

/** Most inputs take a row; some words take as many as their editor asks for. */
const rowsOf = (pin: InputPin) => (typeof pin.editor === "object" && pin.editor.kind === "text" ? (pin.editor.lines ?? 1) : 1);

/**
 * How a node of a kind is laid out, as Blender lays its nodes out: the title,
 * then what it gives, on the right, then what it takes, on the left, each on
 * its own row with its editor beside it, then a foot that says what came out.
 * Nothing about the node but its kind decides it, so a wire stays where its
 * pin is whatever is written on the node. A dial is narrower than the rest.
 */
export function nodeShapeOf(kind: NodeKind | undefined): NodeShape {
  const outputs = new Map<string, Point>();
  const inputs = new Map<string, Point>();
  const rows = new Map<string, number>();
  const width = kind?.role === "dial" ? NODE.dial : NODE.width;
  let y = NODE.header;
  for (const pin of kind?.outputs ?? []) {
    outputs.set(pin.name, { x: width, y: y + NODE.row / 2 });
    y += NODE.row;
  }
  for (const pin of kind?.inputs ?? []) {
    inputs.set(pin.name, { x: 0, y: y + NODE.row / 2 });
    rows.set(pin.name, rowsOf(pin));
    y += NODE.row * rowsOf(pin);
  }
  return { width, height: y + NODE.foot, inputs, outputs, rows };
}
