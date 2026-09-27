/** What one snapshot of the source measures, for the lines that run under the picture. */
export interface Metrics {
  /** Source files, tests left out. */
  readonly files: number;
  readonly tests: number;
  readonly lines: number;
  readonly boxes: number;
  /** Arrows between files that ship. */
  readonly arrows: number;
  /** Of those, the ones that cross from one box into another. */
  readonly crossing: number;
  /** Of those, the ones that need only a type: dependencies inverted onto an interface. */
  readonly typeOnly: number;
  /** Boxes caught in a circle with others. */
  readonly inCycles: number;
  /** Shipped files at least one test imports directly. */
  readonly tested: number;
}
