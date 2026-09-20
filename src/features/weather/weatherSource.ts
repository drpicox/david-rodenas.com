import { socrataUrl } from "../../platform/data/socrataUrl";
import type { YearlySource } from "../../platform/data/YearlySource";
import { histogramOf } from "./histogramOf";
import type { WeatherStation, WeatherVariable, WeatherVariableYear, WeatherYear } from "./WeatherStation";
import { weatherStations } from "./weatherStations";
import { weatherVariables, type WeatherVariableInfo } from "./weatherVariables";

const DATASET = "7bvh-jvq2";
const LIMIT = 50000;
const VARIABLES = Object.entries(weatherVariables) as [WeatherVariable, WeatherVariableInfo][];

/**
 * What the network says about a day. "No representatiu" is an extreme taken
 * over an incomplete day — a minimum recorded at eleven in the morning — and
 * is dropped. An empty mark is an administrative gap, not a bad value: three
 * days of June 2025 have it across the whole network, and fit their neighbours.
 */
const DROPPED = "No representatiu";
const KEPT = ["Representatiu", ""];

type Row = Readonly<Record<string, string | undefined>>;
interface Day {
  readonly date: string;
  readonly value: number;
}

const round = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;

function summaryOf(values: readonly number[], how: WeatherVariableInfo["summary"]): number | null {
  if (values.length === 0) return null;
  if (how === "max") return Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  return round(how === "sum" ? sum : sum / values.length, 2);
}

function variableYear(days: readonly Day[], info: WeatherVariableInfo): WeatherVariableYear {
  const byMonth = Array.from({ length: 12 }, (_, month) => days.filter(({ date }) => Number(date.slice(5, 7)) === month + 1).map(({ value }) => value));
  const highest = days.reduce((a, b) => (b.value > a.value ? b : a));
  const lowest = days.reduce((a, b) => (b.value < a.value ? b : a));
  return {
    months: byMonth.map((values) => histogramOf(values, info.bin, info.range)),
    summaries: byMonth.map((values) => summaryOf(values, info.summary)),
    record: [highest.value, highest.date, lowest.value, lowest.date],
  };
}

/** The rows of one year, sorted into station, variable and day; throws at anything that is not a whole, clean year. */
function daysOf(answer: unknown): Map<string, Day[]> {
  if (!Array.isArray(answer)) throw new Error("the portal did not answer with rows");
  if (answer.length >= LIMIT) throw new Error("the answer was cut short at the limit");
  const rows = answer as Row[];
  if (!rows.some((row) => row["data_lectura"]?.slice(5, 7) === "12")) throw new Error("the year does not reach December yet");

  const days = new Map<string, Day[]>();
  const seen = new Set<string>();
  for (const row of rows) {
    const state = row["estat"] ?? "";
    if (state === DROPPED) continue;
    if (!KEPT.includes(state)) throw new Error(`the network marks days as "${state}", which nobody has decided how to read`);
    const date = row["data_lectura"]?.slice(0, 10) ?? "";
    const key = `${row["codi_estacio"]}/${row["codi_variable"]}`;
    if (seen.has(`${key}/${date}`)) throw new Error(`${key} has ${date} twice`);
    seen.add(`${key}/${date}`);
    const value = Number(row["valor"]);
    if (Number.isFinite(value)) days.set(key, [...(days.get(key) ?? []), { date, value }]);
  }
  return days;
}

/**
 * Daily extremes and rain from the XEMA, the Meteocat's automatic stations.
 * A year of nine stations is some thirteen thousand rows; what is kept of
 * them is their histograms, month by month.
 */
export const weatherSource: YearlySource<WeatherStation> = {
  name: "weather",
  directory: "public/data/weather",
  firstYear: 1988,
  files: weatherStations.map((station) => `${station.code}.json`),
  about: {
    measures: "daily minimum and maximum temperature, daily rain, most rain in one hour",
    network: "Xarxa d'Estacions Meteorològiques Automàtiques (XEMA)",
    attribution: "Servei Meteorològic de Catalunya (XEMA). Dades obertes de la Generalitat de Catalunya.",
    dataset: `https://analisi.transparenciacatalunya.cat/d/${DATASET}`,
    stations: weatherStations,
  },

  requestsFor(year) {
    const codes = weatherStations.map((station) => `'${station.code}'`).join(",");
    const variables = VARIABLES.map(([, info]) => info.code).join(",");
    return [
      socrataUrl(DATASET, {
        select: "codi_estacio,codi_variable,data_lectura,valor,estat",
        where: `codi_estacio in (${codes}) and codi_variable in (${variables}) and data_lectura between '${year}-01-01T00:00:00' and '${year}-12-31T23:59:59'`,
        limit: LIMIT,
      }),
    ];
  },

  withYear(files, year, answers) {
    const days = daysOf(answers[0]);
    return Object.fromEntries(
      weatherStations.map((station) => {
        const file = `${station.code}.json`;
        const measured = VARIABLES.flatMap(([variable, info]) => {
          const ofIt = days.get(`${station.code}/${info.code}`);
          return ofIt ? [[variable, variableYear(ofIt, info)] as const] : [];
        });
        const thisYear: WeatherYear = Object.fromEntries(measured);
        const years = { ...files[file]?.years, ...(measured.length ? { [year]: thisYear } : {}) };
        return [file, { ...station, years }];
      }),
    );
  },
};
