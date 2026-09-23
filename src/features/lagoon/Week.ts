/** One week of a round, after the boats came back and the fish bred: what was in the lagoon, and what each bot took. */
export interface Week {
  readonly fish: number;
  readonly caught: Readonly<Record<string, number>>;
}
