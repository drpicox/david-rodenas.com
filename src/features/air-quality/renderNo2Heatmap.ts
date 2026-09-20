import type { No2Cell } from "./no2Grid";
import { NO2_SCALE_TOP } from "./no2ScaleTop";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** From here up the cell is far enough from the paper that the number in it has to be the paper's colour. */
const DEEP = 0.55;

const hourOf = (index: number) => String(index + 1).padStart(2, "0");

function cell(value: No2Cell, hour: number, month: number): string {
  if (value.mean === null) return '<td class="none"></td>';
  const strength = Math.min(1, Math.round((value.mean / NO2_SCALE_TOP) * 1000) / 1000);
  const deep = strength >= DEEP ? ' class="deep"' : "";
  const title = `${MONTHS[month]}, hour ${hourOf(hour)}: ${value.mean.toFixed(1)} µg/m³, the mean of ${value.count} measurements`;
  return `<td${deep} style="--v:${strength}" title="${title}">${Math.round(value.mean)}</td>`;
}

/**
 * The heat map as a table, because that is what it is: the numbers are in the
 * HTML for a reader with no script and no colours, and the colour is one
 * custom property a cell, mixed by the stylesheet from the page's own ink —
 * so both themes get a ramp without either being written here.
 */
export function renderNo2Heatmap(grid: readonly (readonly No2Cell[])[]): string {
  const head = `<tr><th></th>${MONTHS.map((month) => `<th scope="col">${month.slice(0, 3)}</th>`).join("")}</tr>`;
  const rows = grid.map((row, hour) => `<tr><th scope="row">${hourOf(hour)}</th>${row.map((value, month) => cell(value, hour, month)).join("")}</tr>`);
  return `<table class="heat"><thead>${head}</thead><tbody>${rows.join("")}</tbody></table>`;
}
