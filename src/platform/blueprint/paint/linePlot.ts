import { numberSaid } from "../numberSaid";
import { type Markup, tag } from "../tag";
import { legendOf } from "./legendOf";
import { plotFrame } from "./plotFrame";
import { plotSvg } from "./plotSvg";
import { scaleOf } from "./scaleOf";

export interface Lines {
  /** Each line: its name, and its points, in order along x. */
  readonly series: readonly { readonly name: string; readonly points: readonly (readonly [number, number])[] }[];
  readonly x: string;
  readonly y: string;
  readonly unit?: string;
}

/** Up to this many points a line, each is drawn as a dot too, to be pointed at; more, and the dots would only thicken the line. */
const DOTTED = 60;
const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Lines over a common x, one a series, each in a colour of its own and named
 * along the top. A line breaks where x jumps further than any step it takes
 * elsewhere would explain — a year with nothing measured is a gap, not a
 * straight line drawn across it.
 */
export function linePlot({ series, x, y, unit }: Lines): Markup {
  const all = series.flatMap((line) => line.points);
  const frame = plotFrame({ label: x, scale: scaleOf(all.map(([px]) => px)) }, { label: unit ? `${y} (${unit})` : y, scale: scaleOf(all.map(([, py]) => py)) });
  const marks = series.map((line, index) => {
    const steps = line.points.slice(1).map(([px], at) => px - (line.points[at]?.[0] ?? px));
    const usual = steps.length > 0 ? [...steps].sort((a, b) => a - b)[Math.floor(steps.length / 2)] ?? 0 : 0;
    const d = line.points.map(([px, py], at) => `${at > 0 && px - (line.points[at - 1]?.[0] ?? px) > usual * 1.5 ? "M" : at === 0 ? "M" : "L"}${round(frame.x(px))} ${round(frame.y(py))}`).join(" ");
    const dots = line.points.length <= DOTTED ? line.points.map(([px, py]) => tag("circle", { class: "dot", cx: round(frame.x(px)), cy: round(frame.y(py)), r: 2.4 }, tag("title", {}, `${line.name ? `${line.name}, ` : ""}${numberSaid(px)}: ${numberSaid(py)}${unit ? ` ${unit}` : ""}`))) : [];
    return tag("g", { class: `series bp-s${index % 8}`, "data-key": `line:${line.name}` }, tag("path", { class: "line", d }), dots);
  });
  const legend = legendOf(series.map((line) => line.name));
  return plotSvg(`${y} by ${x}${series.length > 1 ? `, ${series.length} lines` : ""}`, legend.height, frame.grid, tag("g", { class: "marks" }, marks), legend.markup);
}
