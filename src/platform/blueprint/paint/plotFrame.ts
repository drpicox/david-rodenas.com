import { numberSaid } from "../numberSaid";
import { type Markup, tag } from "../tag";
import { PLOT } from "./PLOT";
import type { Scale } from "./scaleOf";

/** One axis: what it is called, and either a scale of numbers or a row of categories, each in a band of its own. */
export interface Axis {
  readonly label: string;
  readonly scale?: Scale;
  readonly bands?: readonly string[];
}

/** Where things go inside the frame, and the frame itself. */
export interface Frame {
  readonly grid: Markup;
  /** Across, for a number on x — or, banded, for the middle of a band by its index. */
  x(value: number): number;
  y(value: number): number;
  readonly band?: { readonly width: number; at(index: number): number };
}

/** No more category names than this along the bottom: more would be written over each other. */
const MOST_NAMED = 12;

/**
 * The frame a picture stands in: the grid at the ticks of each axis, the
 * numbers along them, and the name of each, and the functions that put a
 * value where it goes. A banded axis names only as many categories as fit,
 * evenly spread, always the first.
 */
export function plotFrame(xAxis: Axis, yAxis: Axis): Frame {
  const { width, height, pad } = PLOT;
  const [left, right, top, bottom] = [pad.left, width - pad.right, pad.top, height - pad.bottom];
  const yScale = yAxis.scale;
  const y = (value: number) => (yScale ? bottom - yScale.at(value) * (bottom - top) : bottom);
  const bands = xAxis.bands;
  const band = bands ? { width: (right - left) / Math.max(1, bands.length), at: (index: number) => left + ((index + 0.5) * (right - left)) / Math.max(1, bands.length) } : undefined;
  const x = (value: number) => (band ? band.at(value) : xAxis.scale ? left + xAxis.scale.at(value) * (right - left) : left);

  const yTicks = (yScale?.ticks ?? []).map((tick) => [
    tag("line", { class: "grid", x1: left, x2: right, y1: y(tick), y2: y(tick) }),
    tag("text", { class: "tick y", x: left - 6, y: y(tick) + 3.5, "text-anchor": "end" }, numberSaid(tick)),
  ]);
  const every = bands ? Math.max(1, Math.ceil(bands.length / MOST_NAMED)) : 1;
  const xTicks = bands
    ? bands.flatMap((name, index) => (index % every === 0 ? [tag("text", { class: "tick x", x: x(index), y: bottom + 15, "text-anchor": "middle" }, name)] : []))
    : (xAxis.scale?.ticks ?? []).map((tick) => [
        tag("line", { class: "grid", x1: x(tick), x2: x(tick), y1: top, y2: bottom }),
        tag("text", { class: "tick x", x: x(tick), y: bottom + 15, "text-anchor": "middle" }, numberSaid(tick)),
      ]);
  const grid = tag(
    "g",
    { class: "frame" },
    yTicks,
    xTicks,
    tag("line", { class: "axis", x1: left, x2: right, y1: bottom, y2: bottom }),
    tag("text", { class: "axis-name x", x: (left + right) / 2, y: height - 8, "text-anchor": "middle" }, xAxis.label),
    tag("text", { class: "axis-name y", transform: `translate(14 ${(top + bottom) / 2}) rotate(-90)`, "text-anchor": "middle" }, yAxis.label),
  );
  return { grid, x, y, ...(band && { band }) };
}
