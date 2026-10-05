import type { Cell, Column } from "../../../platform/blueprint/Table";
import type { HistoryRead } from "../readHistory";
import type { Snapshot } from "../Snapshot";

/** A column measured along the way: a value for every node of the graph. */
export interface Measured {
  readonly column: Column;
  readonly values: ReadonlyMap<number, Cell>;
}

/**
 * What flows along a graph's wires: this site's source at one commit, as
 * files — or boxes of files — and the arrows between them, with every
 * column measured on the way, and the history it was read from, which the
 * measures that look back need.
 */
export interface CodeGraph {
  readonly snapshot: Snapshot;
  readonly of: "files" | "boxes";
  /** For a graph of boxes, the files in each, by the box's number. */
  readonly members?: ReadonlyMap<number, readonly number[]>;
  readonly measured: readonly Measured[];
  readonly read: HistoryRead;
  readonly at: number;
}
