export interface Series {
  readonly name: string;
  readonly className: string;
  readonly values: readonly number[];
}

export interface ChartLabels {
  readonly x: string;
  readonly y: string;
}

const W = 480;
const H = 240;
const PAD = { top: 10, right: 10, bottom: 34, left: 36 };

export function chartFrame(top: number, labels: ChartLabels, count: number, ticks: readonly number[]): string {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const y = (value: number) => PAD.top + innerH - (top > 0 ? (value / top) * innerH : 0);
  const grid = ticks
    .map((tick) => `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${y(tick)}" y2="${y(tick)}"/><text x="${PAD.left - 4}" y="${y(tick) + 3}" text-anchor="end">${tick}</text>`)
    .join("");
  // No x ticks when the caller names the categories itself (count of 0).
  const xTicks = (count > 1 ? [1, Math.ceil(count / 2), count] : [])
    .filter((tick, index, all) => all.indexOf(tick) === index)
    .map((tick) => `<text x="${PAD.left + ((tick - 1) / Math.max(1, count - 1)) * innerW}" y="${H - PAD.bottom + 14}" text-anchor="middle">${tick}</text>`)
    .join("");
  return `${grid}${xTicks}<text x="${PAD.left + innerW / 2}" y="${H - 6}" text-anchor="middle">${labels.x}</text><text transform="translate(9 ${PAD.top + innerH / 2}) rotate(-90)" text-anchor="middle">${labels.y}</text>`;
}

export function niceTicks(top: number): number[] {
  if (top <= 0) return [0];
  const step = 10 ** Math.floor(Math.log10(top));
  const unit = top / step >= 5 ? step : top / step >= 2 ? step / 2 : step / 5;
  const ticks: number[] = [];
  for (let tick = 0; tick <= top; tick += unit) ticks.push(Math.round(tick * 100) / 100);
  return ticks;
}

/** Two or three lines over a common x, as inline SVG markup. */
export function lineChart(series: readonly Series[], labels: ChartLabels): string {
  const count = Math.max(...series.map((line) => line.values.length), 1);
  const top = Math.max(1, ...series.flatMap((line) => line.values));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (index / Math.max(1, count - 1)) * innerW;
  const y = (value: number) => PAD.top + innerH - (value / top) * innerH;

  const lines = series
    .map((line) => {
      const points = line.values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
      return `<polyline class="line ${line.className}" points="${points}"><title>${line.name}</title></polyline>`;
    })
    .join("");
  const legend = series
    .map((line, index) => `<rect class="${line.className}" x="${PAD.left + index * 90}" y="${H - PAD.bottom + 20}" width="10" height="3"/><text x="${PAD.left + index * 90 + 14}" y="${H - PAD.bottom + 24}">${line.name}</text>`)
    .join("");

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${labels.y} by ${labels.x}">${chartFrame(top, labels, count, niceTicks(top))}${lines}${legend}</svg>`;
}
