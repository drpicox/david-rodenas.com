import { fixed, yearFrame, type YearSpan } from "./yearFrame";

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
  readonly spans?: readonly YearSpan[];
}

/**
 * One bar a year on a true time axis — a year with no figure keeps its place
 * — from zero, as inline SVG markup. Plain strings, so the build can write it
 * into a page and the browser can draw it again. Each year has a full-height
 * place to press, carrying `data-year`.
 */
export function yearBars(bars: readonly YearBar[], options: YearBarsOptions): string {
  const top = Math.max(options.top ?? 0, ...bars.map(({ value }) => value), 1);
  const frame = yearFrame(bars.map(({ year }) => year), 0, top);
  const { x, y, slot } = frame;

  const marks = bars
    .map(({ year, value, title, chosen, partial }) => {
      const classes = ["bar", chosen ? "chosen" : "", partial ? "partial" : ""].filter(Boolean).join(" ");
      return (
        `<rect class="${classes}" data-year="${year}" x="${fixed(x(year) + slot * 0.15)}" y="${fixed(y(value))}" width="${fixed(slot * 0.7)}" height="${fixed(y(0) - y(value))}"/>` +
        `<rect class="hit" data-year="${year}" x="${fixed(x(year))}" y="${frame.top}" width="${fixed(slot)}" height="${frame.height}"><title>${title}</title></rect>`
      );
    })
    .join("");

  const references = (options.references ?? [])
    .map(({ value, label }) => `<line class="reference" x1="${frame.left}" x2="${frame.right}" y1="${fixed(y(value))}" y2="${fixed(y(value))}"/><text class="reference" x="${frame.right - 2}" y="${fixed(y(value) - 3)}" text-anchor="end">${label}</text>`)
    .join("");

  const spans = frame.levels(options.spans ?? []);

  return frame.wrap(options.label, `${marks}${references}${spans}`);
}
