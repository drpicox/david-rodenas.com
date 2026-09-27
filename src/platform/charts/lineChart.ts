import { CHART } from "./CHART";
import type { ChartLabels } from "./ChartLabels";
import { chartFrame } from "./chartFrame";
import { niceTicks } from "./niceTicks";
import type { Series } from "./Series";

const { width: W, height: H, pad: PAD } = CHART;

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
