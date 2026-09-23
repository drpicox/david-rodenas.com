import type { Cell } from "./Cell";

/**
 * A grown maze, kept the way the Java kept it so the two can be compared:
 * a room is its index, `x + y * width`.
 */
export interface Maze {
  readonly width: number;
  readonly height: number;
  /** Each room's open sides, as `OPEN` bits. */
  readonly cells: readonly number[];
  /** Where the sphere in a room leads. A sphere whose room does not lead back is dead: the file named a viewpoint nobody defined. */
  readonly links: ReadonlyMap<number, number>;
  /** The rooms in the order they were dug, with every step back: the route the DFS camera took. */
  readonly path: readonly Cell[];
}
