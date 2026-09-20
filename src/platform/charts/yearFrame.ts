import { niceTicks } from "./niceTicks";

const W = 720;
const H = 190;
const PAD = { top: 14, right: 8, bottom: 22, left: 34 };

export interface YearSpan {
  readonly from: number;
  readonly to: number;
  readonly value: number;
  readonly label: string;
}

export interface YearFrame {
  /** How wide one year is. */
  readonly slot: number;
  /** The left edge of a year's slot. */
  x(year: number): number;
  y(value: number): number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly height: number;
  /** A level held across a run of years — the mean of a period, drawn over the period. */
  levels(spans: readonly YearSpan[]): string;
  /** The finished SVG around whatever marks it is given. */
  wrap(label: string, marks: string): string;
}

export const fixed = (value: number) => value.toFixed(1);

/**
 * The part every chart of years has in common: a true time axis — a year with
 * no figure keeps its place — labelled every year or every fifth, and a
 * vertical scale between two values with round numbers ruled across.
 */
export function yearFrame(years: readonly number[], bottom: number, top: number): YearFrame {
  const first = Math.min(...years);
  const last = Math.max(...years);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(1, last - first + 1);
  const x = (year: number) => PAD.left + (year - first) * slot;
  const y = (value: number) => PAD.top + innerH - ((value - bottom) / Math.max(1e-9, top - bottom)) * innerH;

  const ticks = niceTicks(top - bottom).map((tick) => Math.round((tick + bottom) * 100) / 100);
  const grid = ticks
    .map((tick) => `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${fixed(y(tick))}" y2="${fixed(y(tick))}"/><text x="${PAD.left - 4}" y="${fixed(y(tick) + 3)}" text-anchor="end">${tick}</text>`)
    .join("");
  const every = last - first > 12 ? 5 : 1;
  const labels = Array.from({ length: last - first + 1 }, (_, index) => first + index)
    .filter((year) => year % every === 0)
    .map((year) => `<text x="${fixed(x(year) + slot / 2)}" y="${H - 6}" text-anchor="middle">${year}</text>`)
    .join("");

  return {
    slot,
    x,
    y,
    left: PAD.left,
    right: W - PAD.right,
    top: PAD.top,
    height: innerH,
    levels: (spans) =>
      spans
        .map(({ from, to, value, label }) => `<line class="span" x1="${fixed(x(from))}" x2="${fixed(x(to) + slot)}" y1="${fixed(y(value))}" y2="${fixed(y(value))}"/><text class="span" x="${fixed((x(from) + x(to) + slot) / 2)}" y="${fixed(y(value) - 5)}" text-anchor="middle">${label}</text>`)
        .join(""),
    wrap: (label, marks) => `<svg class="years" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${grid}${labels}${marks}</svg>`,
  };
}
