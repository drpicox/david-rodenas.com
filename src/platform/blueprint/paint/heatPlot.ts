import { numberSaid } from "../numberSaid";
import { type Markup, tag } from "../tag";
import { PLOT } from "./PLOT";
import { plotSvg } from "./plotSvg";

export interface Heat {
  /** The categories across, and down, in the order they are drawn. */
  readonly xs: readonly string[];
  readonly ys: readonly string[];
  /** A value for a cell, by `x index:y index`; a cell with none is left empty. */
  readonly values: ReadonlyMap<string, number>;
  readonly x: string;
  readonly y: string;
  readonly unit?: string;
}

/** No more names along an edge than this, or they overlap. */
const MOST_NAMED = 12;
const LEGEND = 150;
const round = (value: number) => Math.round(value * 10) / 10;

/**
 * How deep a cell's colour is: one hue mixed into the paper, by as much as
 * the value is of the largest — or, when the values run both sides of zero,
 * a warm hue for above and a cold one for below, so a cold anomaly is not
 * read as a small warm one. Mixed in CSS, so it follows the theme.
 */
function fillOf(value: number, low: number, high: number): string {
  if (low < 0 && high > 0) {
    const share = Math.round((Math.abs(value) / Math.max(-low, high)) * 92) + 4;
    return `color-mix(in srgb, var(${value < 0 ? "--bp-cold" : "--bp-warm"}) ${share}%, var(--paper))`;
  }
  const share = Math.round(((value - low) / Math.max(1e-9, high - low)) * 88) + 8;
  return `color-mix(in srgb, var(--bp-heat) ${share}%, var(--paper))`;
}

/**
 * A grid of cells, a column for each category across and a row for each
 * down, each as deep in colour as its value: the hour of the day against the
 * month of the year, the month against the year. A key under it says what
 * the deepest and the palest cells hold.
 */
export function heatPlot({ xs, ys, values, x, y, unit }: Heat): Markup {
  const { width, height, pad } = PLOT;
  const [left, top, right, bottom] = [pad.left, pad.top, width - pad.right, height - pad.bottom];
  const [cellW, cellH] = [(right - left) / Math.max(1, xs.length), (bottom - top) / Math.max(1, ys.length)];
  const all = [...values.values()];
  const [low, high] = all.length > 0 ? [Math.min(...all), Math.max(...all)] : [0, 1];
  const cells = [...values].map(([key, value]) => {
    const [xi, yi] = key.split(":").map(Number) as [number, number];
    return tag(
      "rect",
      { class: "cell", "data-key": `cell:${xs[xi]}:${ys[yi]}`, x: round(left + xi * cellW), y: round(top + yi * cellH), width: round(cellW + 0.4), height: round(cellH + 0.4), style: `fill: ${fillOf(value, low, high)}` },
      tag("title", {}, `${x} ${xs[xi]}, ${y} ${ys[yi]}: ${numberSaid(value)}${unit ? ` ${unit}` : ""}`),
    );
  });
  const named = (count: number) => Math.max(1, Math.ceil(count / MOST_NAMED));
  const across = xs.flatMap((name, index) => (index % named(xs.length) === 0 ? [tag("text", { class: "tick x", x: round(left + (index + 0.5) * cellW), y: bottom + 14, "text-anchor": "middle" }, name)] : []));
  const down = ys.flatMap((name, index) => (index % named(ys.length) === 0 ? [tag("text", { class: "tick y", x: left - 6, y: round(top + (index + 0.5) * cellH + 3.5), "text-anchor": "end" }, name)] : []));
  const key = tag(
    "g",
    { class: "heat-key" },
    tag("text", { class: "tick", x: right - LEGEND - 6, y: height - 8, "text-anchor": "end" }, numberSaid(low)),
    [0, 1, 2, 3, 4, 5, 6, 7].map((step) => tag("rect", { x: round(right - LEGEND + (step * LEGEND) / 8), y: height - 18, width: round(LEGEND / 8 + 0.4), height: 10, style: `fill: ${fillOf(low + ((high - low) * (step + 0.5)) / 8, low, high)}` })),
    tag("text", { class: "tick", x: right + 4, y: height - 8 }, `${numberSaid(high)}${unit ? ` ${unit}` : ""}`),
  );
  const names = tag(
    "g",
    {},
    tag("text", { class: "axis-name x", x: left, y: height - 8 }, x),
    tag("text", { class: "axis-name y", transform: `translate(14 ${(top + bottom) / 2}) rotate(-90)`, "text-anchor": "middle" }, y),
  );
  return plotSvg(`${unit ? `${unit} ` : ""}by ${x} and ${y}`, tag("g", { class: "marks" }, cells), tag("g", { class: "frame" }, across, down, names), key);
}
