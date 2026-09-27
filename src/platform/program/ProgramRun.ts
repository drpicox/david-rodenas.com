/**
 * What one run of a program gives back, once for each kind of reader: words
 * for a terminal, markup for a page, and the figures themselves for an agent,
 * which would rather have the numbers than a picture of them.
 */
export interface ProgramRun {
  readonly text: string;
  readonly html: string;
  readonly data: unknown;
}
