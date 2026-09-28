/** The files seen at one distance from a change, and how many of them changed too. */
export interface Cascade {
  /** Arrows from a file to the nearest other file its commit changed, going the way they point, into what it needs; none when nothing it needs, near or far, changed. */
  readonly distance: number | null;
  /** Files seen at that distance, once for each commit. */
  readonly seen: number;
  /** Of those, the ones the same commit changed. */
  readonly changed: number;
}
