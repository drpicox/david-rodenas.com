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
  /** The addresses that between them hold one year. */
  requestsFor(year: number): readonly string[];
  /** The files as they are once that year is in them. Throws when the answers are not a whole year. */
  withYear(files: Readonly<Record<string, Held | undefined>>, year: number, answers: readonly unknown[]): Record<string, Held>;
}
