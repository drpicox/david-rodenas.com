import type { Literal } from "./NodeKind";

/** One pin of one node. */
export interface PinRef {
  readonly node: string;
  readonly pin: string;
}

/** From an output to an input: what one node gives, another takes. */
export interface Wire {
  readonly from: PinRef;
  readonly to: PinRef;
}

/** A node standing on the canvas: its kind, where it stands, and what is written on it. */
export interface PlacedNode {
  /** Its name in the blueprint's text, which is how a wire finds it. */
  readonly id: string;
  readonly kind: string;
  readonly x: number;
  readonly y: number;
  /** What it is called on the canvas and on the board, when its kind's title is not enough. */
  readonly title?: string;
  /** The inputs written on it by hand. */
  readonly values: Readonly<Record<string, Literal>>;
}

/**
 * A program drawn as boxes and wires: data comes in on the left, flows along
 * the wires through steps, and comes out on the board as pictures. It is only
 * data — kinds named, values written, wires drawn — so it can be written as
 * text, kept, linked to, and run anywhere the kinds it names are.
 */
export interface Blueprint {
  readonly nodes: readonly PlacedNode[];
  readonly wires: readonly Wire[];
}
