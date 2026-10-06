import { describe, expect, it } from "vitest";
import { coreTypes } from "../../../platform/blueprint/coreTypes";
import { kitOf } from "../../../platform/blueprint/kitOf";
import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { Pending } from "../../../platform/blueprint/Pending";
import type { Table } from "../../../platform/blueprint/Table";
import type { RunningYear } from "../../../platform/data/RunningYear";
import { histogramOf } from "../histogramOf";
import type { WeatherStation, WeatherYear } from "../WeatherStation";
import { weatherVariables } from "../weatherVariables";
import { weatherDaysNode } from "./weatherDaysNode";
import { weatherMonthsNode } from "./weatherMonthsNode";
import { weatherNodes } from "./weatherNodes";
import { weatherStationChoice } from "./weatherStationChoice";
import { weatherStationsNode } from "./weatherStationsNode";
import { weatherStationsRead } from "./weatherStationsRead";

const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / values.length;

/** A year where each month's every night is as warm as its list says, in turn; days are 10 degrees warmer; it rains 1 mm a day. */
function yearOf(year: number, nights: (month: number) => number[]): WeatherYear {
  const byMonth = Array.from({ length: 12 }, (_, month) => Array.from({ length: daysIn(year, month) }, (_, day) => nights(month)[day % nights(month).length] ?? 0));
  const variable = (values: number[][], name: "tn" | "tx" | "pp") => ({
    months: values.map((each) => histogramOf(each, weatherVariables[name].bin, weatherVariables[name].range)),
    summaries: values.map((each) => (name === "pp" ? each.reduce((a, b) => a + b, 0) : mean(each))),
    record: [0, `${year}-01-01`, 0, `${year}-01-01`] as const,
  });
  return { tn: variable(byMonth, "tn"), tx: variable(byMonth.map((each) => each.map((night) => night + 10)), "tx"), pp: variable(byMonth.map((each) => each.map(() => 1)), "pp") };
}

const station: WeatherStation = {
  code: "WU",
  name: "Badalona - Museu",
  municipality: "Badalona",
  altitude: 42,
  setting: "urban, by the sea",
  years: { "2024": yearOf(2024, (month) => (month === 6 ? [26, 22, 22] : [12])), "2025": yearOf(2025, (month) => (month === 6 ? [26, 26, 22] : [12])) },
};
const running: RunningYear<WeatherStation> = {
  year: 2026,
  through: "2026-01-31",
  refreshed: "2026-10-02",
  files: { "WU.json": { ...station, years: { "2026": { tn: { months: [histogramOf([12, 12], 0.5, [-30, 35]), ...Array.from({ length: 11 }, () => null)], summaries: [12, ...Array.from({ length: 11 }, () => null)], record: [12, "2026-01-01", 12, "2026-01-01"] } } } } },
};
const files = (withRunning: boolean): Record<string, string> => ({
  "/data/weather/index.json": JSON.stringify({ attribution: "Servei Meteorològic de Catalunya (XEMA).", dataset: "https://example.org", years: [2024, 2025], refreshed: "2026-09-21" }),
  "/data/weather/WU.json": JSON.stringify(station),
  ...(withRunning && { "/data/weather/running.json": JSON.stringify(running) }),
});
const reading = (held: Record<string, string>) => ({
  read: (path: string) => {
    const text = held[path];
    if (text === undefined) throw new Error(`no ${path}`);
    return text;
  },
});
const tableOf = (kind: NodeKind, inputs: Record<string, unknown>, withRunning = false) => kind.run(inputs, reading(files(withRunning))).outputs?.["table"] as Table;

describe("the stations a weather node reads", () => {
  it("are one, or every one, and credit the network with the day the copy was brought up to date", () => {
    const { stations, credit } = weatherStationsRead(reading(files(true)).read, "WU");
    expect(stations.map((each) => each.code)).toEqual(["WU"]);
    expect(credit).toEqual({ said: "Servei Meteorològic de Catalunya (XEMA).", refreshed: "2026-10-02" });
  });

  it("wait for the year still running while it is on its way, and do without it when it is not there", () => {
    const pending = (path: string) => {
      if (path.endsWith("running.json")) throw new Pending(path);
      return files(false)[path] ?? "";
    };
    expect(() => weatherStationsRead(pending, "WU")).toThrow(Pending);
    expect(weatherStationsRead(reading(files(false)).read, "WU").stations[0]?.soFar).toBeUndefined();
  });

  it("refuse a station there is none of", () => {
    expect(() => weatherStationsRead(reading(files(false)).read, "ZZ")).toThrow("station: there is no station ZZ");
  });

  it("are offered by name, and all of them at once", () => {
    expect(weatherStationChoice.kind === "choice" && weatherStationChoice.choices.at(-1)).toEqual({ value: "all", label: "every station" });
  });
});

describe("a weather station, month by month", () => {
  it("gives a row a month, with the month's own figures, whole when nearly every day was measured", () => {
    const table = tableOf(weatherMonthsNode, { station: "WU" });
    expect(table.rows.length).toBe(24);
    expect(table.rows[6]).toMatchObject({ year: 2024, month: 7, tn: (11 * 26 + 20 * 22) / 31, tx: (11 * 36 + 20 * 32) / 31, rain: 31, days: 31, whole: "yes" });
    expect(table.columns.filter((column) => column.key).map((column) => column.name)).toEqual(["year", "month", "season"]);
    expect(table.rows[6]?.["season"]).toBe("summer");
  });

  it("goes on into the year still running, as far as it goes, and never calls it whole", () => {
    expect(tableOf(weatherMonthsNode, { station: "WU" }, true).rows.at(-1)).toMatchObject({ year: 2026, month: 1, days: 2, whole: "no" });
  });
});

describe("the days of a kind, year by year", () => {
  it("counts the torrid nights of each year from the histograms", () => {
    const table = tableOf(weatherDaysNode, { station: "WU", kind: "torrid-nights" });
    expect(table.rows.map((row) => [row["year"], row["days"], row["whole"]])).toEqual([
      [2024, 11, "yes"],
      [2025, 21, "yes"],
    ]);
  });

  it("moves the threshold, and counts only in the months asked for", () => {
    const table = tableOf(weatherDaysNode, { station: "WU", kind: "torrid-nights", threshold: 22, months: "6 7" });
    expect(table.rows.map((row) => row["days"])).toEqual([31, 31]);
    expect(() => tableOf(weatherDaysNode, { station: "WU", kind: "torrid-nights", months: "13" })).toThrow("months: 13 is not a month: January is 1, December 12");
  });

  it("says what it counted, in words", () => {
    expect(weatherDaysNode.run({ station: "WU", kind: "frost-days" }, reading(files(false))).said).toBe("frost days: daily minimum < 0 °C");
  });
});

describe("the weather stations themselves", () => {
  it("are a row each, with how high they stand", () => {
    expect(tableOf(weatherStationsNode, {}).rows[0]).toEqual({ station: "WU", name: "Badalona - Museu", municipality: "Badalona", altitude: 42, setting: "urban, by the sea" });
  });
});

describe("what the weather brings a blueprint", () => {
  it("is found by name beside the nodes every blueprint has", () => {
    expect(kitOf(weatherNodes, coreTypes).kinds.has("weather-days")).toBe(true);
  });
});
