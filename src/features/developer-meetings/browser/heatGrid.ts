import { el } from "../../../platform/browser/el";
import { WORK_WEEK } from "../WORK_WEEK";

/** A week as a grid of hours, each cell as warm as its value is high among the others. */
export function heatGrid(title: string, cells: readonly (readonly number[])[]): HTMLElement {
  const all = cells.flat();
  const low = Math.min(...all);
  const high = Math.max(...all);
  const grid = el("div", { class: "week" }, el("span"), ...WORK_WEEK.dayNames.map((day) => el("span", { class: "head" }, day)));
  cells.forEach((row, hour) => {
    grid.append(el("span", { class: "hour" }, WORK_WEEK.hourNames[hour] ?? ""));
    for (const value of row) {
      const heat = high > low ? (value - low) / (high - low) : 0;
      grid.append(el("span", { class: "cell", style: `--heat:${(0.1 + heat * 0.9).toFixed(2)}` }, String(Math.round(value))));
    }
  });
  return el("div", {}, el("h4", {}, title), grid);
}
