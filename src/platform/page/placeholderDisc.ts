/**
 * A dim disc of `░` in a block of character cells, the shape the mark in the
 * header has before a script grows a world in it — and all a reader without a
 * script ever sees, which is why it is a shape and not a hole. A cell is twice
 * as tall as it is wide, so the disc is drawn on a grid of half-cells.
 */
export function placeholderDisc(columns: number, rows: number): string {
  const radius = Math.min(columns, rows * 2) / 2;
  const centreX = columns / 2 - 0.5;
  const centreY = rows - 0.5;
  const inside = (x: number, y: number) => (x - centreX) ** 2 + (y - centreY) ** 2 <= radius ** 2;
  const lines: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let column = 0; column < columns; column += 1) {
      line += inside(column, row * 2) || inside(column, row * 2 + 1) ? "░" : " ";
    }
    lines.push(line.trimEnd());
  }
  return lines.join("\n");
}
