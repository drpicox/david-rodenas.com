import type { YearlySource } from "../../platform/data/YearlySource";
import { gridAnswerOf } from "./gridAnswerOf";
import type { SeaFile } from "./SeaPoint";
import { seaPoints } from "./seaPoints";

const SERVER = "https://psl.noaa.gov/thredds/dodsC/Datasets/noaa.oisst.v2.highres";
const DAY = 86_400_000;
/** The days of OISST are counted from the first of January of 1800. */
const EPOCH = Date.UTC(1800, 0, 1);
/** The days one request asks for: the server reads about three a second, and gives up after a minute. */
const BLOCK = 92;
/** How many days behind the newest values stand. */
const LAG = 3;
/** The day of January from which a finished year's last values are no longer revised — they may be for fifteen days — and the day the deploy asks for the year that ended. */
const SETTLED = 15;

const daysIn = (year: number) => (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY;
/** Where a point stands in the grid of quarter degrees, from 89.875° south and from 0.125° east. */
const latIndexOf = (lat: number) => Math.round((lat + 89.875) / 0.25);
const lonIndexOf = (lon: number) => Math.round((lon - 0.125) / 0.25);
/** The smallest box of cells that holds every point: asking for it costs the server what asking for one cell does. */
const BOX = (() => {
  const [lats, lons] = [seaPoints.map((point) => latIndexOf(point.lat)), seaPoints.map((point) => lonIndexOf(point.lon))];
  return `[${Math.min(...lats)}:1:${Math.max(...lats)}][${Math.min(...lons)}:1:${Math.max(...lons)}]`;
})();
const round = (value: number | null) => (value === null ? null : Math.round(value * 100) / 100);
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

/** A year's answers read into a value a day for each point, the days checked to follow one another from the first of January. */
function daysOf(year: number, answers: readonly unknown[]): { count: number; values: Map<string, (number | null)[]> } {
  const values = new Map(seaPoints.map((point) => [point.code, [] as (number | null)[]]));
  const first = (Date.UTC(year, 0, 1) - EPOCH) / DAY;
  let count = 0;
  for (const answer of answers) {
    const grid = gridAnswerOf(String(answer));
    for (const [at, time] of grid.times.entries()) {
      if (time !== first + count) throw new Error(`the days of ${year} are not in order: day ${time - first} came where day ${count} was due`);
      for (const point of seaPoints) {
        const lat = grid.lats.findIndex((each) => near(each, point.lat));
        const lon = grid.lons.findIndex((each) => near(each, point.lon));
        if (lat < 0 || lon < 0) throw new Error(`the answer has no cell at ${point.lat}, ${point.lon}`);
        values.get(point.code)?.push(round(grid.values[at]?.[lat]?.[lon] ?? null));
      }
      count += 1;
    }
  }
  return { count, values };
}

/**
 * The temperature of the sea's surface off the Catalan coast, a day at a
 * time since 1982: NOAA's daily Optimum Interpolation analysis, version 2.1,
 * a grid of quarter degrees made of satellites, ships and buoys, read off the
 * server of NOAA's Physical Sciences Laboratory. It answers in words, slowly,
 * so a year is asked for a quarter at a time, every point in one box.
 */
export const seaSource: YearlySource<SeaFile> = {
  name: "sea",
  directory: "public/data/sea",
  firstYear: 1982,
  answers: "text",
  files: seaPoints.map((point) => `${point.code}.json`),
  about: {
    measures: "the temperature of the sea's surface, a day at a time, in cells of a quarter of a degree",
    dataset: "https://psl.noaa.gov/data/gridded/data.noaa.oisst.v2.highres.html",
    attribution: "NOAA OISST v2.1 (Huang and others, 2021): data provided by the NOAA PSL, Boulder, Colorado, USA, from their website at https://psl.noaa.gov.",
    points: seaPoints,
  },

  requestsFor(year, today) {
    if (year < today.getUTCFullYear() && today.getTime() < Date.UTC(year + 1, 0, SETTLED)) throw new Error(`the last days of ${year} are revised until the middle of January`);
    const days = Math.min(daysIn(year), Math.floor((today.getTime() - Date.UTC(year, 0, 1)) / DAY) - LAG + 1);
    if (days < 1) throw new Error(`the server has no day of ${year} yet`);
    return Array.from({ length: Math.ceil(days / BLOCK) }, (_, block) => {
      const asked = `[${block * BLOCK}:1:${Math.min(days, (block + 1) * BLOCK) - 1}]${BOX}`;
      return `${SERVER}/sst.day.mean.${year}.nc.ascii?sst${asked.replaceAll("[", "%5B").replaceAll("]", "%5D")}`;
    });
  },

  withYear(files, year, answers) {
    const { count, values } = daysOf(year, answers);
    if (count !== daysIn(year)) throw new Error(`${year} has ${count} days, not ${daysIn(year)}`);
    return Object.fromEntries(seaPoints.map((point) => [`${point.code}.json`, { ...point, years: { ...files[`${point.code}.json`]?.years, [year]: values.get(point.code) ?? [] } }]));
  },

  soFar(year, answers) {
    const { count, values } = daysOf(year, answers);
    if (count === 0) throw new Error(`the server has no day of ${year} yet`);
    const files = Object.fromEntries(seaPoints.map((point) => [`${point.code}.json`, { ...point, years: { [year]: values.get(point.code) ?? [] } }]));
    return { files, through: new Date(Date.UTC(year, 0, count)).toISOString().slice(0, 10) };
  },
};
