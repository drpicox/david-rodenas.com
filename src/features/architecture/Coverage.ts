/** How much of each file the tests run, at one commit: the share of its lines, 0 to 100, by its path under `src/`. */
export interface Coverage {
  readonly sha: string;
  readonly lines: Readonly<Record<string, number>>;
}
