/** One line, or one set of bars, of a chart: its name for the legend, the class that colours it, and its values in order. */
export interface Series {
  readonly name: string;
  readonly className: string;
  readonly values: readonly number[];
}
