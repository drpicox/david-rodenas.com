/**
 * One commit of the kata: which of the three moves it is, the two files as
 * they stand after it, and what the slide says beside them.
 *
 * `test` writes or changes a test, `code` writes what a test asks for, and
 * `clean` changes the code or the tests without adding one, and must leave
 * them passing.
 */
export interface KataStep {
  readonly commit: number;
  readonly stage: "test" | "code" | "clean";
  /** bowling.spec.js */
  readonly test: string;
  /** bowling.js — empty until the class exists. */
  readonly code: string;
  /** The smells the slide keeps listed at this commit, still to clean. */
  readonly smells: readonly string[];
  /** What the slide says about the step, when it says something. */
  readonly note?: string;
}
