import { bandOf } from "./bandOf";
import type { Life } from "./Life";
import { matrixRowOf } from "./matrixRowOf";

/** One box of the source as it stands now, and what every commit did in it. */
export interface MatrixRow {
  /** None for the row of the files that are gone. */
  readonly box: string | null;
  readonly band: string | null;
  /** `[commit, changed, written]` for every commit that changed or wrote one of its files. */
  readonly cells: readonly (readonly [number, number, number])[];
}

/**
 * Where the changes went, commit by commit: a row for each box there is now,
 * holding every file that stands in it over the whole of that file's life —
 * also from before it moved there — and a last row for the files that are
 * gone. The bands come in the order given, the picture's own, and inside a
 * band the box written first comes first, so the source reads as it grew.
 * Only what ships: a test changes when what it tests does.
 */
export function changeMatrixOf(lives: readonly Life[], bands: readonly string[]): MatrixRow[] {
  const rows = new Map<string | null, { born: number; cells: Map<number, [number, number, number]> }>();
  const mark = (row: { cells: Map<number, [number, number, number]> }, at: number, changed: number, written: number) => {
    const [, wasChanged, wasWritten] = row.cells.get(at) ?? [at, 0, 0];
    row.cells.set(at, [at, wasChanged + changed, wasWritten + written]);
  };
  for (const life of lives) {
    if (life.test) continue;
    const box = matrixRowOf(life);
    const row = rows.get(box) ?? { born: life.born, cells: new Map() };
    row.born = Math.min(row.born, life.born);
    rows.set(box, row);
    mark(row, life.born, 0, 1);
    for (const at of life.changed) mark(row, at, 1, 0);
  }
  const rank = (band: string | null) => (band === null ? Infinity : bands.includes(band) ? bands.indexOf(band) : bands.length);
  return [...rows]
    .map(([box, { born, cells }]) => ({ box, band: box === null ? null : bandOf(box), born, cells: [...cells.values()].sort((a, b) => a[0] - b[0]) }))
    .sort((a, b) => rank(a.band) - rank(b.band) || a.born - b.born || (a.box ?? "").localeCompare(b.box ?? ""))
    .map(({ box, band, cells }) => ({ box, band, cells }));
}
