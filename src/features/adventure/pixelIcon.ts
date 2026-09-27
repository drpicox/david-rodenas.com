/**
 * A small picture drawn as rows of letters, one letter a pixel and a dot for
 * none, painted in the colours the letters stand for. A run of one colour is
 * one rectangle, and the edges stay sharp however large it is shown.
 */
export function pixelIcon(rows: readonly string[], colours: Readonly<Record<string, string>>): string {
  const width = Math.max(...rows.map((row) => row.length));
  const rects: string[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const letter = row[x] ?? ".";
      let end = x + 1;
      while (row[end] === letter) end += 1;
      const colour = colours[letter];
      if (letter !== "." && colour) rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${colour}"/>`);
      x = end;
    }
  });
  return `<svg class="pixel" viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${rects.join("")}</svg>`;
}
