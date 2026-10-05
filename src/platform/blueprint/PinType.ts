/**
 * What flows along a wire: a number, some words, a table, a graph. Each is
 * drawn in its own colour, as Unreal draws its pins, so that what fits where
 * is seen before it is tried.
 */
export interface PinType {
  readonly name: string;
  /** How it is said: "a table". */
  readonly label: string;
  /** The custom property its pins and wires are drawn in. */
  readonly colour: string;
  /** What a value of it is, in a few words: 420 rows, 816 files. */
  describe(value: unknown): string;
  /** What else it can be wired into, and how it becomes that: a graph is also the table of its files. */
  readonly becomes?: Readonly<Record<string, (value: unknown) => unknown>>;
}
