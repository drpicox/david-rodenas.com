import { niceTicks } from "./niceTicks";

export interface YearBar {
  readonly year: number;
  readonly value: number;
  /** What pointing at it says. */
  readonly title: string;
  readonly chosen?: boolean;
  /** Drawn as an outline: there is a figure, and it is of less than a year. */
  readonly partial?: boolean;
}

export interface YearBarsOptions {
  readonly label: string;
  /** The least the scale reaches; it grows when a bar is taller. */
  readonly top?: number;
  /** Figures the bars are held against, ruled across the whole chart. */
  readonly references?: readonly { readonly value: number; readonly label: string }[];
  /** A level held across a run of years: the mean of a period, drawn over the period. */
  readonly spans?: readonly { readonly from: number; readonly to: number; readonly value: number; readonly label: string }[];
}

const W = 720;
const H = 190;
const PAD = { top: 14, right: 8, bottom: 22, left: 30 };

const fixed = (value: number) => value.toFixed(1);

/**
 * One bar a year on a true time axis — a year with no figure keeps its place
 * — from zero, as inline SVG markup. Plain strings, so the build can write it
 * into a page and the browser can draw it again. Each year has a full-height
 * place to press, carrying `data-year`.
 */
export function yearBars(bars: readonly YearBar[], options: YearBarsOptions): string {
  const first = Math.min(...bars.map(({ year }) => year));
  const last = Math.max(...bars.map(({ year }) => year));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(1, last - first + 1);
  const top = Math.max(options.top ?? 0, ...bars.map(({ value }) => value), 1);
  const x = (year: number) => PAD.left + (year - first) * slot;
  const y = (value: number) => PAD.top + innerH - (value / top) * innerH;

  const grid = niceTicks(top)
    .map((tick) => `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${fixed(y(tick))}" y2="${fixed(y(tick))}"/><text x="${PAD.left - 4}" y="${fixed(y(tick) + 3)}" text-anchor="end">${tick}</text>`)
    .join("");

  const every = last - first > 12 ? 5 : 1;
  const labels = Array.from({ length: last - first + 1 }, (_, index) => first + index)
    .filter((year) => year % every === 0)
    .map((year) => `<text x="${fixed(x(year) + slot / 2)}" y="${H - 6}" text-anchor="middle">${year}</text>`)
    .join("");

  const marks = bars
    .map(({ year, value, title, chosen, partial }) => {
      const classes = ["bar", chosen ? "chosen" : "", partial ? "partial" : ""].filter(Boolean).join(" ");
      return (
        `<rect class="${classes}" data-year="${year}" x="${fixed(x(year) + slot * 0.15)}" y="${fixed(y(value))}" width="${fixed(slot * 0.7)}" height="${fixed(y(0) - y(value))}"/>` +
        `<rect class="hit" data-year="${year}" x="${fixed(x(year))}" y="${PAD.top}" width="${fixed(slot)}" height="${innerH}"><title>${title}</title></rect>`
      );
    })
    .join("");

  const references = (options.references ?? [])
    .map(({ value, label }) => `<line class="reference" x1="${PAD.left}" x2="${W - PAD.right}" y1="${fixed(y(value))}" y2="${fixed(y(value))}"/><text class="reference" x="${W - PAD.right - 2}" y="${fixed(y(value) - 3)}" text-anchor="end">${label}</text>`)
    .join("");

  const spans = (options.spans ?? [])
    .map(({ from, to, value, label }) => `<line class="span" x1="${fixed(x(from))}" x2="${fixed(x(to) + slot)}" y1="${fixed(y(value))}" y2="${fixed(y(value))}"/><text class="span" x="${fixed((x(from) + x(to) + slot) / 2)}" y="${fixed(y(value) - 4)}" text-anchor="middle">${label}</text>`)
    .join("");

  return `<svg class="years" viewBox="0 0 ${W} ${H}" role="img" aria-label="${options.label}">${grid}${labels}${marks}${references}${spans}</svg>`;
}
