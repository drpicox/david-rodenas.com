import { chartFrame, niceTicks, type ChartLabels, type Series } from "./lineChart";

const W = 480;
const H = 240;
const PAD = { top: 10, right: 10, bottom: 34, left: 36 };

/** Grouped bars, one group per x, as inline SVG markup. */
export function barChart(series: readonly Series[], labels: ChartLabels, categories?: readonly string[]): string {
  const count = Math.max(...series.map((bars) => bars.values.length), 1);
  const top = Math.max(1, ...series.flatMap((bars) => bars.values));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const group = innerW / count;
  const width = (group * 0.7) / series.length;
  const y = (value: number) => PAD.top + innerH - (value / top) * innerH;

  const bars = series
    .map((line, which) =>
      line.values
        .map((value, index) => {
          const x = PAD.left + index * group + group * 0.15 + which * width;
          return `<rect class="${line.className}" x="${x.toFixed(1)}" y="${y(value).toFixed(1)}" width="${width.toFixed(1)}" height="${(PAD.top + innerH - y(value)).toFixed(1)}"><title>${line.name}: ${Math.round(value * 10) / 10}</title></rect>`;
        })
        .join(""),
    )
    .join("");
  const names = (categories ?? [])
    .map((name, index) => `<text x="${PAD.left + index * group + group / 2}" y="${H - PAD.bottom + 14}" text-anchor="middle">${name}</text>`)
    .join("");
  const legend = series
    .map((line, index) => `<rect class="${line.className}" x="${PAD.left + index * 90}" y="${H - PAD.bottom + 20}" width="10" height="3"/><text x="${PAD.left + index * 90 + 14}" y="${H - PAD.bottom + 24}">${line.name}</text>`)
    .join("");

  const frame = chartFrame(top, labels, categories ? 0 : count, niceTicks(top));
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${labels.y} by ${labels.x}">${frame}${bars}${names}${legend}</svg>`;
}
