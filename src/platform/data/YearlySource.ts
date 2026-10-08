/**
 * Open data that arrives a year at a time and is kept in the repository: one
 * file for each thing measured, every finished year inside it. The files are
 * both the history and what the browser is served, so there is no second copy
 * to fall out of step.
 */
export interface YearlySource<Held> {
  readonly name: string;
  /** Where the files are kept, from the root of the repository. */
  readonly directory: string;
  readonly firstYear: number;
  /** The files it keeps, by name, without the index. */
  readonly files: readonly string[];
  /** What the index says besides the years held: who measured, where, under what terms. */
  readonly about: Readonly<Record<string, unknown>>;
  /** How its portal answers: JSON, as most do, or words to be read — a table written out as text. */
  readonly answers?: "json" | "text";
  /**
   * The addresses that between them hold one year — told what day it is, for
   * a year still running whose days the portal holds can only be reckoned
   * from it, or a year not yet to be asked for. Throws to wait.
   */
  requestsFor(year: number, today: Date): readonly string[];
  /**
   * For a portal that names its file anew each year, from a page that stays
   * put: the address of the file, read off the page each request reaches.
   * Throws when the page no longer links to one.
   */
  follow?(page: string): string;
  /** The files as they are once that year is in them. Throws when the answers are not a whole year. */
  withYear(files: Readonly<Record<string, Held | undefined>>, year: number, answers: readonly unknown[]): Record<string, Held>;
  /**
   * The year still running, as files holding only it, and the last day it
   * reaches. Throws when the answers are not a clean run of days. Without it,
   * a source shows finished years alone.
   */
  soFar?(year: number, answers: readonly unknown[]): { files: Record<string, Held>; through: string };
}
