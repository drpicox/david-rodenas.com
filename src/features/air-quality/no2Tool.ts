import { pageShowing } from "../../platform/content/pageShowing";
import { dayAndMonthOf } from "../../platform/data/dayAndMonthOf";
import { readRunning } from "../../platform/data/readRunning";
import type { SourceIndex } from "../../platform/data/renderSourceLine";
import type { RunningYear } from "../../platform/data/RunningYear";
import { withSoFar, type WithSoFar } from "../../platform/data/withSoFar";
import type { AgentTool, ToolSurroundings } from "../../platform/plugin/AgentTool";
import { askedNo2, type AskedNo2 } from "./askedNo2";
import { no2AnnualMeans } from "./no2AnnualMeans";
import { no2Grid, type No2Cell } from "./no2Grid";
import type { No2Station } from "./No2Station";
import { no2Stations } from "./no2Stations";

const APP = "no2";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = { all: "every day of the week", workdays: "Monday to Friday", weekends: "Saturdays and Sundays" };
const oneDecimal = (value: number) => Math.round(value * 10) / 10;
const hourOf = (hour: number) => String(hour).padStart(2, "0");
const cellInWords = ({ month, hour, meanMicrogramsPerM3 }: { month: number; hour: number; meanMicrogramsPerM3: number }) => `hour ${hourOf(hour)} of ${MONTHS[month - 1]}: ${meanMicrogramsPerM3} µg/m³`;

const runningFrom = (read: ToolSurroundings["read"]) => read("/data/no2/running.json").then((text) => readRunning<No2Station>(() => text, ""), () => null);

/** The stations that arrived, the year still running among their years; one whose file did not is left out rather than failing the rest. */
async function stationsAt(codes: readonly string[], read: ToolSurroundings["read"], running: RunningYear<No2Station> | null): Promise<WithSoFar<No2Station>[]> {
  const asked = await Promise.allSettled(codes.map((code) => read(`/data/no2/${code}.json`).then((text) => withSoFar(JSON.parse(text) as No2Station, running, `${code}.json`))));
  return asked.flatMap((station) => (station.status === "fulfilled" ? [station.value] : []));
}

/** Every year's mean, on the days asked for, the year still running marked with the day it reaches. */
function annualMeansOf(station: WithSoFar<No2Station>, days: AskedNo2["days"]) {
  return no2AnnualMeans(station, days).map(({ year, mean, measured }) => ({
    year,
    meanMicrogramsPerM3: oneDecimal(mean),
    measuredShare: Math.round(measured * 100) / 100,
    ...(year === station.soFar?.year && { soFarThrough: station.soFar.through }),
  }));
}

/** The table's cells as figures: rows are the hours 1 to 24, columns the months January to December. */
function cellsOf(grid: readonly (readonly No2Cell[])[]) {
  return grid.flatMap((row, hour) => row.flatMap((cell, month) => (cell.mean === null ? [] : [{ month: month + 1, hour: hour + 1, meanMicrogramsPerM3: oneDecimal(cell.mean), measurements: cell.count }])));
}

/** One station, the years and days asked for: the table, its mean, where it is highest and lowest, and every year's mean. */
function oneStation(station: WithSoFar<No2Station>, asked: AskedNo2) {
  const held = Object.keys(station.years).map(Number);
  const from = Math.max(asked.from ?? -Infinity, Math.min(...held));
  const to = Math.min(asked.to ?? Infinity, Math.max(...held));
  const grid = no2Grid(station, { from, to, days: asked.days });
  const cells = cellsOf(grid);
  const measurements = cells.reduce((sum, cell) => sum + cell.measurements, 0);
  const mean = measurements ? oneDecimal(grid.flat().reduce((sum, cell) => sum + (cell.mean ?? 0) * cell.count, 0) / measurements) : null;
  const byMean = [...cells].sort((a, b) => b.meanMicrogramsPerM3 - a.meanMicrogramsPerM3);
  const { month, hour } = asked;
  const table =
    month !== undefined && hour !== undefined
      ? { cell: cells.find((cell) => cell.month === month && cell.hour === hour) ?? null }
      : month !== undefined
        ? { byHour: grid.map((row) => (row[month - 1]?.mean === null ? null : oneDecimal(row[month - 1]!.mean!))) }
        : hour !== undefined
          ? { byMonth: (grid[hour - 1] ?? []).map((cell) => (cell.mean === null ? null : oneDecimal(cell.mean))) }
          : { byHourAndMonth: grid.map((row) => row.map((cell) => (cell.mean === null ? null : oneDecimal(cell.mean)))) };
  return {
    station: { code: station.code, name: station.name, kind: station.kind, area: station.area },
    days: DAYS[asked.days],
    from,
    to,
    meanMicrogramsPerM3: mean,
    ...(byMean[0] && { highest: byMean[0], lowest: byMean.at(-1) }),
    ...table,
    annualMeans: annualMeansOf(station, asked.days).filter(({ year }) => year >= from && year <= to),
  };
}

function oneInWords(answer: ReturnType<typeof oneStation>, soFar?: { year: number; through: string }): string {
  const { station, days, from, to, meanMicrogramsPerM3, highest, lowest, annualMeans } = answer;
  const years = `${from === to ? from : `${from}–${to}`}${soFar && soFar.year >= from && soFar.year <= to ? `, ${soFar.year} to ${dayAndMonthOf(soFar.through)}` : ""}`;
  const asked = "cell" in answer && answer.cell ? ` In ${cellInWords(answer.cell)}.` : "";
  const extremes = highest && lowest ? `; highest in ${cellInWords(highest)}, lowest in ${cellInWords(lowest)}` : "";
  const finished = annualMeans.filter(({ soFarThrough }) => !soFarThrough).at(-1);
  const running = annualMeans.find(({ soFarThrough }) => soFarThrough);
  const lately = `${finished ? ` ${finished.year}: ${finished.meanMicrogramsPerM3} µg/m³.` : ""}${running ? ` ${running.year} so far, to ${dayAndMonthOf(running.soFarThrough!)}: ${running.meanMicrogramsPerM3} µg/m³.` : ""}`;
  return `${station.name}, ${days}, ${years}: ${meanMicrogramsPerM3 ?? "nothing measured"}${meanMicrogramsPerM3 === null ? "" : " µg/m³ on average"}${extremes}.${asked}${lately}`;
}

/**
 * The NO2 page as a tool: the same sums the page draws, asked a station, a
 * run of years, which days of the week, and an hour or a month of the table
 * when the question is that narrow — or every station side by side. The
 * EU's annual limit is 40 µg/m³, and the WHO has recommended 10 since 2021.
 */
export const no2Tool: AgentTool = {
  name: "no2",
  description:
    "Hourly NO2 at eleven measuring points of the Generalitat de Catalunya, from 1991, added up by hour of the day and month of the year: for a station, the mean of the years and days asked for, hour by month, where it is highest and lowest, and the mean of every year, the year still running so far; for all, the stations side by side. " +
    "The EU's annual limit is 40 µg/m³; the WHO's guideline, since 2021, is 10.",
  inputSchema: {
    type: "object",
    properties: {
      station: { type: "string", enum: [...no2Stations.map(({ code }) => code), "all"], default: no2Stations[0]?.code, description: `${no2Stations.map(({ code, name, kind }) => `${code} ${name}, ${kind}`).join("; ")}; or all of them` },
      days: { type: "string", enum: ["all", "workdays", "weekends"], default: "all", description: "every day, Monday to Friday, or Saturdays and Sundays" },
      from: { type: "integer", description: "the first year; the station's first when left out" },
      to: { type: "integer", description: "the last year; the station's last, the year still running among them, when left out" },
      month: { type: "integer", minimum: 1, maximum: 12, description: "one month of the table, January being 1" },
      hour: { type: "integer", minimum: 1, maximum: 24, description: "one hour of the table, numbered 1 to 24 as the network numbers them, without saying by which clock" },
    },
    required: [],
    additionalProperties: false,
  },
  readOnly: true,
  shows: true,
  async answer(input, { site, read }) {
    const asked = askedNo2(input);
    if ("refused" in asked) return asked;
    const index = JSON.parse(await read("/data/no2/index.json")) as SourceIndex;
    const running = await runningFrom(read);
    const stations = await stationsAt(asked.codes, read, running);
    if (stations.length === 0) return { refused: "the measurements did not arrive; ask again" };
    const route = pageShowing(site, APP)?.route;
    const around = {
      source: index.attribution,
      refreshed: running && stations.some((station) => station.soFar) ? running.refreshed : index.refreshed,
      ...(route !== undefined && { route }),
    };

    if (asked.codes.length === 1) {
      const [station] = stations;
      const answer = oneStation(station!, asked);
      return {
        summary: oneInWords(answer, station!.soFar),
        data: answer,
        ...around,
        show: { app: APP, values: { station: station!.code, from: answer.from, to: answer.to, days: asked.days } },
      };
    }

    // Side by side, on the last year every station could have finished; the year still running is beside it, never instead of it.
    const side = stations.map((station) => {
      const means = annualMeansOf(station, asked.days);
      return { station, means, finished: means.filter(({ soFarThrough }) => !soFarThrough) };
    });
    const year = Math.max(...side.flatMap(({ finished }) => finished.map(({ year }) => year)));
    const ranked = side
      .map(({ station, means, finished }) => ({
        code: station.code,
        name: station.name,
        kind: station.kind,
        area: station.area,
        year,
        meanMicrogramsPerM3: finished.find((mean) => mean.year === year)?.meanMicrogramsPerM3 ?? null,
        soFar: means.find(({ soFarThrough }) => soFarThrough) ?? null,
      }))
      .sort((a, b) => (b.meanMicrogramsPerM3 ?? -1) - (a.meanMicrogramsPerM3 ?? -1));
    const said = ranked.map(({ name, meanMicrogramsPerM3 }) => `${name} ${meanMicrogramsPerM3 === null ? "not measured" : `${meanMicrogramsPerM3} µg/m³`}`).join("; ");
    return { summary: `The mean of ${year}, ${DAYS[asked.days]}: ${said}.`, data: { days: DAYS[asked.days], stations: ranked }, ...around };
  },
};
