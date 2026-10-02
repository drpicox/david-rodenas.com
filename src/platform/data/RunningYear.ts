/**
 * The year still running, kept apart from the finished ones: what a source's
 * files would hold of it, the last day it reaches, and the day it was asked.
 * Never committed — it changes every day, and a commit back from every deploy
 * would leave the main line behind wherever it was pushed from.
 */
export interface RunningYear<Held> {
  readonly year: number;
  /** The last day measured, as YYYY-MM-DD. */
  readonly through: string;
  /** The day it was asked for, as YYYY-MM-DD. */
  readonly refreshed: string;
  readonly files: Readonly<Record<string, Held>>;
}
