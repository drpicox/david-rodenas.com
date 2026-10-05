import { numberSaid } from "../numberSaid";
import { type Markup, tag } from "../tag";
import { legendOf } from "./legendOf";
import { plotFrame } from "./plotFrame";
import { plotSvg } from "./plotSvg";
import { scaleOf } from "./scaleOf";

export interface Scatter {
  readonly points: readonly { readonly x: number; readonly y: number; readonly key: string; readonly label?: string; readonly group?: number }[];
  /** The names of the groups the points are coloured by, when they are. */
  readonly groups?: readonly string[];
  readonly x: string;
  readonly y: string;
  /** The straight line least squares fit through the points, drawn across them. */
  readonly fit?: { readonly slope: number; readonly intercept: number };
}

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Two columns against each other, a dot a row: what goes with what, at a
 * glance. Coloured by a group when there is one, with the line fitted
 * through them when asked; each dot says which row it is when pointed at,
 * and is keyed by it, so a dot that moves is the same dot moving.
 */
export function scatterPlot({ points, groups = [], x, y, fit }: Scatter): Markup {
  const frame = plotFrame({ label: x, scale: scaleOf(points.map((point) => point.x)) }, { label: y, scale: scaleOf(points.map((point) => point.y)) });
  const dots = points.map((point) =>
    tag("circle", { class: `dot bp-s${(point.group ?? 0) % 8}`, "data-key": `dot:${point.key}`, cx: round(frame.x(point.x)), cy: round(frame.y(point.y)), r: 3.2 }, tag("title", {}, `${point.label ?? point.key}: ${numberSaid(point.x)}, ${numberSaid(point.y)}`)),
  );
  const xs = points.map((point) => point.x);
  const line =
    fit && Number.isFinite(fit.slope) && points.length > 1
      ? tag("line", { class: "fit", "data-key": "fit", x1: round(frame.x(Math.min(...xs))), y1: round(frame.y(fit.intercept + fit.slope * Math.min(...xs))), x2: round(frame.x(Math.max(...xs))), y2: round(frame.y(fit.intercept + fit.slope * Math.max(...xs))) })
      : null;
  const legend = legendOf(groups);
  return plotSvg(`${y} against ${x}, ${points.length} points`, legend.height, frame.grid, tag("g", { class: "marks" }, dots), line ?? tag("g", {}), legend.markup);
}
