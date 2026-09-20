import type { Feature } from "../../platform/plugin/Feature";
import { no2Source } from "./no2Source";

/** NO2 by the hour of the day and the month of the year, from the Generalitat's measuring points. */
export const airQualityFeature: Feature = {
  name: "air-quality",
  sources: [no2Source],
};
