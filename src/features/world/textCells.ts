import { nearestVga } from "./nearestVga";
import type { TextCell } from "./TextCell";

/**
 * A square RGBA picture as a block of character cells. A text-mode cell is
 * twice as tall as it is wide, and ▀ paints its top half in the letter's
 * colour and its bottom half in the colour behind it — so one cell shows two
 * pixels, one above the other, and a picture of `size` pixels is `size`
 * cells across and half as many down. Where nothing was painted there is sky.
 */
export function textCells(pixels: Uint8ClampedArray, size: number): TextCell[][] {
  const colourAt = (x: number, y: number): number => {
    const at = (y * size + x) * 4;
    if ((pixels[at + 3] ?? 0) === 0) return -1;
    return nearestVga(pixels[at] ?? 0, pixels[at + 1] ?? 0, pixels[at + 2] ?? 0);
  };
  const rows: TextCell[][] = [];
  for (let row = 0; row < size / 2; row += 1) {
    const cells: TextCell[] = [];
    for (let x = 0; x < size; x += 1) cells.push({ top: colourAt(x, row * 2), bottom: colourAt(x, row * 2 + 1) });
    rows.push(cells);
  }
  return rows;
}
