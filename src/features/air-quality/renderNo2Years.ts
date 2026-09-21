import { yearBars } from "../../platform/charts/yearBars";
import type { No2AnnualMean } from "./no2AnnualMeans";
import { no2Colour } from "./no2Colour";
import { NO2_SCALE_TOP } from "./no2ScaleTop";

/** Below this share of the year's hours, the mean is drawn as an outline: it is a mean of something less than a year. */
const ENOUGH = 0.75;

/** The two figures an annual mean of NO2 is held against: the EU's limit value, and the WHO's 2021 guideline. */
const REFERENCES = [
  { value: 40, label: "EU limit, 40" },
  { value: 10, label: "WHO guideline, 10" },
];

/**
 * The mean of each year as a bar, on the same fixed scale as the colours, so
 * two stations can be compared by eye. A bar is also the way to choose a year.
 */
export function renderNo2Years(years: readonly No2AnnualMean[], chosen: { readonly from: number; readonly to: number }): string {
  const bars = years.map(({ year, mean, measured }) => {
    const partial = measured < ENOUGH;
    const why = partial ? `, from only ${Math.round(measured * 100)}% of the year's hours` : "";
    return { year, value: mean, partial, colour: no2Colour(mean).background, chosen: year >= chosen.from && year <= chosen.to, title: `${year}: ${mean.toFixed(1)} µg/m³${why}` };
  });
  return yearBars(bars, { label: "Mean NO2 of each year, µg/m³", top: NO2_SCALE_TOP, references: REFERENCES });
}
