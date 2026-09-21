import type { No2Cell } from "./no2Grid";
import { no2Colour } from "./no2Colour";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const hourOf = (index: number) => String(index + 1).padStart(2, "0");

function cell(value: No2Cell, hour: number, month: number): string {
  if (value.mean === null) return '<td class="none"></td>';
  const { background, light } = no2Colour(value.mean);
  const deep = light ? ' class="deep"' : "";
  const title = `${MONTHS[month]}, hour ${hourOf(hour)}: ${value.mean.toFixed(1)} µg/m³, the mean of ${value.count} measurements`;
  return `<td${deep} style="background:${background}" title="${title}">${Math.round(value.mean)}</td>`;
}

/**
 * The heat map as a table, because that is what it is: the numbers are in the
 * HTML for a reader with no script and no colours, and the colour of each
 * says at a glance whether that hour was good or bad.
 */
export function renderNo2Heatmap(grid: readonly (readonly No2Cell[])[]): string {
  const head = `<tr><th></th>${MONTHS.map((month) => `<th scope="col">${month.slice(0, 3)}</th>`).join("")}</tr>`;
  const rows = grid.map((row, hour) => `<tr><th scope="row">${hourOf(hour)}</th>${row.map((value, month) => cell(value, hour, month)).join("")}</tr>`);
  return `<table class="heat graded"><thead>${head}</thead><tbody>${rows.join("")}</tbody></table>`;
}
