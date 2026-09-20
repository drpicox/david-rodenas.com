import type { No2AnnualMean } from "./no2AnnualMeans";
import { NO2_SCALE_TOP } from "./no2ScaleTop";

const W = 720;
const H = 190;
const PAD = { top: 12, right: 8, bottom: 22, left: 30 };

/** Below this share of the year's hours, the mean is drawn as an outline: it is a mean of something less than a year. */
const ENOUGH = 0.75;

/** The two figures an annual mean of NO2 is held against: the EU's limit value, and the WHO's 2021 guideline. */
const REFERENCES = [
  { value: 40, label: "EU limit, 40" },
  { value: 10, label: "WHO guideline, 10" },
];

/**
 * The mean of each year as a bar, on the same fixed scale as the colours, so
 * two stations can be compared by eye. A bar is also the way to choose a year:
 * each has a full-height place to press.
 */
export function renderNo2Years(years: readonly No2AnnualMean[], chosen: { readonly from: number; readonly to: number }): string {
  const first = years[0]?.year ?? chosen.from;
  const last = years[years.length - 1]?.year ?? chosen.to;
  const slots = last - first + 1;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const top = Math.max(NO2_SCALE_TOP, ...years.map(({ mean }) => mean));
  const slot = innerW / slots;
  const x = (year: number) => PAD.left + (year - first) * slot;
  const y = (value: number) => PAD.top + innerH - (value / top) * innerH;
  const fixed = (value: number) => value.toFixed(1);

  const grid = [0, 20, 40, 60, 80]
    .map((tick) => `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${fixed(y(tick))}" y2="${fixed(y(tick))}"/><text x="${PAD.left - 4}" y="${fixed(y(tick) + 3)}" text-anchor="end">${tick}</text>`)
    .join("");

  const labels = Array.from({ length: slots }, (_, index) => first + index)
    .filter((year) => year % 5 === 0)
    .map((year) => `<text x="${fixed(x(year) + slot / 2)}" y="${H - 6}" text-anchor="middle">${year}</text>`)
    .join("");

  const bars = years
    .map(({ year, mean, measured }) => {
      const partial = measured < ENOUGH;
      const classes = ["bar", year >= chosen.from && year <= chosen.to ? "chosen" : "", partial ? "partial" : ""].filter(Boolean).join(" ");
      const why = partial ? `, from only ${Math.round(measured * 100)}% of the year's hours` : "";
      const title = `<title>${year}: ${mean.toFixed(1)} µg/m³${why}</title>`;
      return (
        `<rect class="${classes}" data-year="${year}" x="${fixed(x(year) + slot * 0.15)}" y="${fixed(y(mean))}" width="${fixed(slot * 0.7)}" height="${fixed(y(0) - y(mean))}"/>` +
        `<rect class="hit" data-year="${year}" x="${fixed(x(year))}" y="${PAD.top}" width="${fixed(slot)}" height="${innerH}">${title}</rect>`
      );
    })
    .join("");

  const references = REFERENCES.map(
    ({ value, label }) => `<line class="reference" x1="${PAD.left}" x2="${W - PAD.right}" y1="${fixed(y(value))}" y2="${fixed(y(value))}"/><text class="reference" x="${W - PAD.right - 2}" y="${fixed(y(value) - 3)}" text-anchor="end">${label}</text>`,
  ).join("");

  return `<svg class="years" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mean NO2 of each year, µg/m³">${grid}${labels}${bars}${references}</svg>`;
}
