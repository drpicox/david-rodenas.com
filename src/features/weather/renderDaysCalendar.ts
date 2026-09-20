import type { YearOfDays } from "./daysPerYear";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** From here up the cell is far enough from the paper that the number in it takes the paper's colour. */
const DEEP = 0.55;

function cell(year: number, month: number, { days, measured }: { days: number; measured: number }): string {
  const name = `${MONTHS[month]} ${year}`;
  if (measured === 0) return `<td class="none" title="${name}: not measured"></td>`;
  const share = Math.round((days / measured) * 1000) / 1000;
  const deep = share >= DEEP ? ' class="deep"' : "";
  return `<td${deep} style="--v:${share}" title="${name}: ${days} of ${measured} days">${days || ""}</td>`;
}

/**
 * A row a year and a column a month: whether the season is getting longer is
 * a question about the edges of this table. The colour is the share of the
 * month's measured days, so a short month can be as full as a long one.
 */
export function renderDaysCalendar(years: readonly YearOfDays[], warm: boolean): string {
  const head = `<tr><th></th>${MONTHS.map((month) => `<th scope="col">${month.slice(0, 3)}</th>`).join("")}</tr>`;
  const rows = [...years]
    .reverse()
    .map(({ year, months }) => `<tr><th scope="row">${year}</th>${months.map((month, index) => cell(year, index, month)).join("")}</tr>`);
  return `<table class="heat calendar${warm ? " warm" : ""}"><thead>${head}</thead><tbody>${rows.join("")}</tbody></table>`;
}
