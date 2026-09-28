import type { Life } from "./Life";
import { matrixRowOf } from "./matrixRowOf";

/** The files of one cell: those its commit changed in its box, and those it wrote there. */
export interface MatrixCell {
  readonly changed: readonly string[];
  readonly written: readonly string[];
}

/**
 * What each cell of the picture of changes holds, by name, for a reader who
 * points at one: the same rows the picture has — a box as it stands now, the
 * files that are gone apart — and the same files, what ships and not its tests.
 */
export function matrixCellsOf(lives: readonly Life[]): { get(box: string | null, at: number): MatrixCell } {
  const cells = new Map<string, { changed: string[]; written: string[] }>();
  const cell = (box: string | null, at: number) => {
    const key = `${box ?? ""}@${at}`;
    const found = cells.get(key) ?? { changed: [], written: [] };
    cells.set(key, found);
    return found;
  };
  for (const life of lives) {
    if (life.test) continue;
    const box = matrixRowOf(life);
    cell(box, life.born).written.push(life.path);
    for (const at of life.changed) cell(box, at).changed.push(life.path);
  }
  const sorted = ({ changed, written }: MatrixCell): MatrixCell => ({ changed: [...changed].sort(), written: [...written].sort() });
  return { get: (box, at) => sorted(cells.get(`${box ?? ""}@${at}`) ?? { changed: [], written: [] }) };
}
