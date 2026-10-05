import { numberSaid } from "../numberSaid";
import { type Markup, tag } from "../tag";
import { plotFrame } from "./plotFrame";
import { plotSvg } from "./plotSvg";
import { scaleOf } from "./scaleOf";

export interface Bars {
  readonly categories: readonly string[];
  /** One for each category; nothing where nothing was measured, which is a gap and not a zero. */
  readonly values: readonly (number | null)[];
  /** Bars drawn faint: a year not measured whole, a year still running. */
  readonly faded?: readonly boolean[];
  readonly x: string;
  readonly y: string;
  readonly unit?: string;
}

/** How much of its band a bar takes: the rest is the air between bars. */
const FILL = 0.78;

/**
 * Bars, one a category, standing on zero — a bar that does not start at zero
 * lies about the size of what it shows. Each says its value when pointed at,
 * and is keyed by its category, so a bar that grows is the same bar growing.
 */
export function barPlot({ categories, values, faded = [], x, y, unit }: Bars): Markup {
  const frame = plotFrame({ label: x, bands: categories }, { label: unit ? `${y} (${unit})` : y, scale: scaleOf(values.filter((value): value is number => value !== null), { zero: true }) });
  const width = (frame.band?.width ?? 0) * FILL;
  const bars = values.flatMap((value, index) => {
    if (value === null) return [];
    const [top, base] = [frame.y(Math.max(0, value)), frame.y(Math.min(0, value))];
    const category = categories[index] ?? "";
    return [
      tag(
        "rect",
        { class: faded[index] ? "bar faded" : "bar", "data-key": `bar:${category}`, x: round(frame.x(index) - width / 2), y: round(top), width: round(width), height: round(Math.max(0.5, base - top)) },
        tag("title", {}, `${category}: ${numberSaid(value)}${unit ? ` ${unit}` : ""}`),
      ),
    ];
  });
  return plotSvg(`${y} by ${x}`, frame.grid, tag("g", { class: "marks" }, bars));
}

const round = (value: number) => Math.round(value * 10) / 10;
