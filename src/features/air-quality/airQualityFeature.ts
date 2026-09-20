import type { Feature } from "../../platform/plugin/Feature";
import { mountNo2 } from "./browser/mountNo2";
import { no2Source } from "./no2Source";
import { no2Still } from "./no2Still";

/** NO2 by the hour of the day and the month of the year, from the Generalitat's measuring points. */
export const airQualityFeature: Feature = {
  name: "air-quality",
  apps: { no2: mountNo2 },
  stills: { no2: no2Still },
  sources: [no2Source],
};
