/** What is kept of Barcelona's series: every year held, the mean temperature of each of its months in °C, January to December — nothing where a month has none. */
export interface BarcelonaSeries {
  readonly years: Readonly<Record<string, readonly (number | null)[]>>;
}
