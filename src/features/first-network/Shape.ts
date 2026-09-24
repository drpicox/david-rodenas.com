/** A drawing the network can be taught, and the name it answers with when it sees it. */
export interface Shape {
  readonly name: string;
  /** Twenty-five cells, row by row from the top: 1 is ink. */
  readonly pixels: readonly number[];
}
