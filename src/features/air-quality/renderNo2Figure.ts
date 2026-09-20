import { no2AnnualMeans } from "./no2AnnualMeans";
import { no2Grid } from "./no2Grid";
import { NO2_SCALE_TOP } from "./no2ScaleTop";
import type { No2Selection } from "./No2Selection";
import type { No2Station } from "./No2Station";
import { renderNo2Heatmap } from "./renderNo2Heatmap";
import { renderNo2Years } from "./renderNo2Years";

const DAYS = { all: "every day of the week", workdays: "Monday to Friday", weekends: "Saturdays and Sundays" };

function key(): string {
  const ticks = [0, 20, 40, 60, NO2_SCALE_TOP].map((tick) => `<span>${tick === NO2_SCALE_TOP ? `${tick}+` : tick}</span>`).join("");
  return `<div class="scale" aria-hidden="true"><div class="ramp"></div><div class="ticks">${ticks}</div></div>`;
}

/**
 * The figure for one station and one selection, as markup. The build writes
 * it into the page and the browser draws it again on every change, from this
 * same function — which is what keeps the two from ever disagreeing.
 */
export function renderNo2Figure(station: No2Station, selection: No2Selection): string {
  const held = Object.keys(station.years).map(Number);
  const from = Math.max(selection.from, Math.min(...held));
  const to = Math.min(selection.to, Math.max(...held));
  const years = from === to ? String(from) : `${from}–${to}`;

  return (
    `<figure class="no2">` +
    `<figcaption><strong>${station.name}</strong> · ${station.kind}, ${station.area} · mean NO2 in µg/m³ by hour of the day and month of the year · ${DAYS[selection.days]}, ${years}</figcaption>` +
    renderNo2Heatmap(no2Grid(station, selection)) +
    key() +
    `<h4>The mean of each year, ${DAYS[selection.days]}</h4>` +
    renderNo2Years(no2AnnualMeans(station, selection.days), { from, to }) +
    `</figure>`
  );
}
