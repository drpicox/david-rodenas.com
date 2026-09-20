import type { WeatherVariable } from "./WeatherStation";

export interface WeatherVariableInfo {
  /** The network's own number for it. */
  readonly code: number;
  readonly unit: string;
  readonly name: string;
  /** How a month, a season or a year of it is one figure: temperatures average, rain adds up, an intensity peaks. */
  readonly summary: "mean" | "sum" | "max";
  /** The width of a histogram bin, and the range the bins cover; days beyond it are counted in the last bin. */
  readonly bin: number;
  readonly range: readonly [number, number];
}

/** Each variable is summed up differently, and that is the part that cannot be copied from temperature to rain. */
export const weatherVariables: Readonly<Record<WeatherVariable, WeatherVariableInfo>> = {
  tn: { code: 1002, unit: "°C", name: "daily minimum", summary: "mean", bin: 0.5, range: [-30, 35] },
  tx: { code: 1001, unit: "°C", name: "daily maximum", summary: "mean", bin: 0.5, range: [-25, 50] },
  pp: { code: 1300, unit: "mm", name: "daily rain", summary: "sum", bin: 0.5, range: [0, 250] },
  pi: { code: 1303, unit: "mm/h", name: "most rain in one hour", summary: "max", bin: 0.5, range: [0, 100] },
};
