import { socrataUrl } from "../../platform/data/socrataUrl";
import type { YearlySource } from "../../platform/data/YearlySource";
import type { No2Station, No2Year } from "./No2Station";
import { no2Stations } from "./no2Stations";

const DATASET = "tasf-thgu";
const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour + 1).padStart(2, "0"));
const SUNDAY = 0;
const SATURDAY = 6;

type Row = Readonly<Record<string, string | undefined>>;

/** The same shape as HourlySums, while it is still being added to. */
interface Tally {
  readonly sums: number[][];
  readonly counts: number[][];
}

const empty = (): number[][] => Array.from({ length: 12 }, () => new Array<number>(24).fill(0));
const emptyYear = (): { workdays: Tally; weekends: Tally } => ({ workdays: { sums: empty(), counts: empty() }, weekends: { sums: empty(), counts: empty() } });

function rowsOf(answer: unknown): Row[] {
  if (!Array.isArray(answer)) throw new Error("the portal did not answer with rows");
  if (answer.length === 0) throw new Error("the portal answered with no rows");
  return answer as Row[];
}

function add(into: Tally, row: Row): void {
  const month = Number(row["month"]) - 1;
  HOURS.forEach((hour, index) => {
    const sums = into.sums[month];
    const counts = into.counts[month];
    if (!sums || !counts) throw new Error(`month ${row["month"]} is not a month`);
    sums[index] = (sums[index] ?? 0) + Number(row[`s${hour}`] ?? 0);
    counts[index] = (counts[index] ?? 0) + Number(row[`n${hour}`] ?? 0);
  });
}

/**
 * Hourly NO2 from the Generalitat's air-quality network. The portal does the
 * adding up: one question a year comes back as a few hundred rows instead of
 * the three thousand days they summarise.
 */
export const no2Source: YearlySource<No2Station> = {
  name: "no2",
  directory: "public/data/no2",
  firstYear: 1991,
  files: no2Stations.map((station) => `${station.code}.json`),
  about: {
    measures: "NO2, hourly, µg/m³",
    network: "Xarxa de Vigilància i Previsió de la Contaminació Atmosfèrica",
    publisher: "Generalitat de Catalunya, open data",
    dataset: `https://analisi.transparenciacatalunya.cat/d/${DATASET}`,
    stations: no2Stations,
  },

  requestsFor(year) {
    const codes = no2Stations.map((station) => `'${station.code}'`).join(",");
    const sums = HOURS.map((hour) => `sum(h${hour}) as s${hour}, count(h${hour}) as n${hour}`).join(", ");
    return [
      socrataUrl(DATASET, {
        select: `codi_eoi, date_extract_m(data) as month, date_extract_dow(data) as dow, count(*) as days, ${sums}`,
        where: `contaminant='NO2' and codi_eoi in (${codes}) and data between '${year}-01-01T00:00:00' and '${year}-12-31T23:59:59'`,
        group: "codi_eoi,month,dow",
        limit: 5000,
      }),
    ];
  },

  withYear(files, year, answers) {
    const rows = rowsOf(answers[0]);
    // A day of the week comes round five times a month at most; more is the same days twice.
    if (rows.some((row) => Number(row["days"]) > 5)) throw new Error("some days are in the portal twice");
    if (!rows.some((row) => row["month"] === "12")) throw new Error("the year does not reach December yet");

    const measured = new Map<string, { workdays: Tally; weekends: Tally }>();
    for (const row of rows) {
      const code = row["codi_eoi"] ?? "";
      const station = measured.get(code) ?? emptyYear();
      measured.set(code, station);
      const dow = Number(row["dow"]);
      add(dow === SUNDAY || dow === SATURDAY ? station.weekends : station.workdays, row);
    }

    return Object.fromEntries(
      no2Stations.map((station) => {
        const file = `${station.code}.json`;
        const thisYear: No2Year | undefined = measured.get(station.code);
        const years = { ...files[file]?.years, ...(thisYear ? { [year]: thisYear } : {}) };
        return [file, { ...station, years }];
      }),
    );
  },
};
