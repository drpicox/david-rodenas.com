import { CHART } from "./CHART";
import type { ChartLabels } from "./ChartLabels";

const { width: W, height: H, pad: PAD } = CHART;

/** The grid, the ticks and the axis names every small chart stands on. */
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
