/** A cell of the sea's grid off a stretch of coast: what it is called, and its centre. */
export interface SeaPoint {
  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

/** What is kept of a point: the point, and every year held, a value a day in °C — nothing where a day has none. */
export interface SeaFile extends SeaPoint {
  readonly years: Readonly<Record<string, readonly (number | null)[]>>;
}
