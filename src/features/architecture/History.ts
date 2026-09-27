/** One commit that changed the source: when, and what it said it did. */
export interface Commit {
  readonly sha: string;
  readonly date: string;
  readonly subject: string;
}

/**
 * How one snapshot differs from the one before it. A module keeps its number
 * for as long as git can follow it, across renames, so a file that moved from
 * one box to another is the same ball flying, not one ball vanishing and
 * another appearing.
 */
export interface Change {
  /** `[id, path, lines, test]` for each module that appeared. */
  readonly added: readonly (readonly [number, string, number, boolean])[];
  readonly removed: readonly number[];
  /** `[id, path]` for each module that moved. */
  readonly moved: readonly (readonly [number, string])[];
  /** `[id, lines]` for each module that grew or shrank. */
  readonly resized: readonly (readonly [number, number])[];
  /** `[from, to, typeOnly]` for each arrow that appeared, or changed what it needs. */
  readonly linked: readonly (readonly [number, number, boolean])[];
  /** `[from, to]` for each arrow that went. */
  readonly unlinked: readonly (readonly [number, number])[];
}

/** The source, commit by commit, as the architecture page plays it. */
export interface History {
  readonly commits: readonly Commit[];
  /** One for each commit: the first against nothing, each other against the one before. */
  readonly changes: readonly Change[];
}
