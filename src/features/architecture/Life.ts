/** One file across the history: when it was written, what changed it, and when it went, if it did. */
export interface Life {
  readonly id: number;
  /** Where it stands at the last commit, or stood when it went. */
  readonly path: string;
  readonly lines: number;
  readonly test: boolean;
  readonly typesOnly: boolean;
  /** The commit that brought it, counted from the first. */
  readonly born: number;
  /** The commit it went in, if it went. */
  readonly went?: number;
  /** The commits that changed it, in order: never the one that brought it. */
  readonly changed: readonly number[];
}
