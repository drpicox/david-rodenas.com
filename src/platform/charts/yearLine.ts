import type { YearBar, YearBarsOptions } from "./yearBars";
import { fixed, yearFrame } from "./yearFrame";

/**
 * A dot a year, joined where the years are neighbours. For a figure such as a
 * mean temperature, whose zero is arbitrary: bars from zero would make every
 * year look the same. Takes what `yearBars` takes, so the two can stand in
 * for each other.
 */
export function yearLine(points: readonly YearBar[], options: YearBarsOptions): string {
  const values = points.map(({ value }) => value);
  const bottom = Math.floor(Math.min(...values, ...(options.spans ?? []).map(({ value }) => value)));
  const top = Math.ceil(Math.max(...values, bottom + 1));
  const frame = yearFrame(points.map(({ year }) => year), bottom, top);
  const { x, y, slot } = frame;
  const centre = (year: number) => x(year) + slot / 2;

  const runs: (typeof points)[number][][] = [];
  for (const point of points) {
    const run = runs[runs.length - 1];
    if (run && run[run.length - 1]?.year === point.year - 1) run.push(point);
    else runs.push([point]);
  }
  const lines = runs
    .map((run) => `<polyline class="line" points="${run.map(({ year, value }) => `${fixed(centre(year))},${fixed(y(value))}`).join(" ")}"/>`)
    .join("");
  const dots = points
    .map(({ year, value, title, partial }) => `<circle class="dot${partial ? " partial" : ""}" cx="${fixed(centre(year))}" cy="${fixed(y(value))}" r="3.5"><title>${title}</title></circle>`)
    .join("");
  const spans = frame.levels(options.spans ?? []);

  return frame.wrap(options.label, `${lines}${dots}${spans}`);
}
