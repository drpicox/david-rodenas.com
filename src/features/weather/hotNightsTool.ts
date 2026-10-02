import { pageShowing } from "../../platform/content/pageShowing";
import { dayAndMonthOf } from "../../platform/data/dayAndMonthOf";
import { readRunning } from "../../platform/data/readRunning";
import type { RunningYear } from "../../platform/data/RunningYear";
import type { SourceIndex } from "../../platform/data/renderSourceLine";
import { withSoFar, type WithSoFar } from "../../platform/data/withSoFar";
import type { AgentTool, ToolSurroundings } from "../../platform/plugin/AgentTool";
import { askedQuestion } from "./askedQuestion";
import { daysPerYear } from "./daysPerYear";
import { questionInWords } from "./questionInWords";
import { recordOf } from "./recordOf";
import { twoHalves } from "./twoHalves";
import type { WeatherQuestion } from "./WeatherQuestion";
import type { WeatherStation } from "./WeatherStation";
import { weatherPresets } from "./weatherPresets";
import { weatherStations } from "./weatherStations";
import { weatherVariables } from "./weatherVariables";

const APP = "weather";
const oneDecimal = (value: number) => Math.round(value * 10) / 10;
const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / values.length;

const runningFrom = (read: ToolSurroundings["read"]) => read("/data/weather/running.json").then((text) => readRunning<WeatherStation>(() => text, ""), () => null);

/** The stations that arrived, the year still running among their years; one whose file did not is left out rather than failing the rest. */
async function stationsAt(codes: readonly string[], read: ToolSurroundings["read"], running: RunningYear<WeatherStation> | null): Promise<WithSoFar<WeatherStation>[]> {
  const asked = await Promise.allSettled(codes.map((code) => read(`/data/weather/${code}.json`).then((text) => withSoFar(JSON.parse(text) as WeatherStation, running, `${code}.json`))));
  return asked.flatMap((station) => (station.status === "fulfilled" ? [station.value] : []));
}

/** One station asked the question: every year, the two halves of its record, and its most extreme day. */
function countedAt(station: WithSoFar<WeatherStation>, question: WeatherQuestion, from = -Infinity, to = Infinity) {
  const years = daysPerYear(station, question);
  const halves = twoHalves(years);
  const whole = years.filter((year) => year.whole);
  const record = recordOf(station, question);
  return {
    station: { code: station.code, name: station.name, municipality: station.municipality, altitudeMetres: station.altitude, setting: station.setting },
    years: years
      .filter(({ year }) => year >= from && year <= to)
      .map(({ year, days, whole, measured, expected, through }) => ({ year, days, whole, measuredDays: measured, expectedDays: expected, ...(through && { soFarThrough: through }) })),
    halves: halves?.map((half) => ({ from: half.from, to: half.to, years: half.years, daysPerYear: oneDecimal(half.days) })) ?? null,
    ...(halves && { changeDaysPerYear: oneDecimal(halves[1].days - halves[0].days) }),
    // The second half of the record; or every whole year, when the record is too short to halve.
    daysPerYearRecently: halves ? oneDecimal(halves[1].days) : whole.length ? oneDecimal(mean(whole.map(({ days }) => days))) : null,
    ...(record && { [question.atLeast ? "highestOnRecord" : "lowestOnRecord"]: { value: record.value, unit: weatherVariables[question.variable].unit, date: record.date } }),
  };
}

function oneInWords(counted: ReturnType<typeof countedAt>, said: string, soFar?: { year: number; through: string }): string {
  const [first, second] = counted.halves ?? [];
  const halves = first && second ? `: ${first.daysPerYear} a year ${first.from}–${first.to}, ${second.daysPerYear} a year ${second.from}–${second.to} (${counted.changeDaysPerYear! >= 0 ? "+" : ""}${counted.changeDaysPerYear})` : ": too few whole years to halve the record";
  const running = soFar && counted.years.find(({ year }) => year === soFar.year);
  return `${counted.station.name}, ${said}${halves}.${running ? ` ${soFar.year} so far, to ${dayAndMonthOf(soFar.through)}: ${running.days}.` : ""}`;
}

/**
 * The hot nights page as a tool: days of a kind — tropical or torrid nights,
 * hot days, frost, rain — counted year by year from the same histograms the
 * page draws, at one station or at every one side by side, with the year
 * still running marked as such. What an agent asks is the page's question,
 * so the reader can be shown the very figure it was answered from.
 */
export const hotNightsTool: AgentTool = {
  name: "hot-nights",
  description:
    "Days of a kind counted year by year at nine weather stations of the Meteocat in Catalonia, from 1988: tropical nights (the daily minimum at 20 °C or more), torrid nights (25 °C or more), hot and torrid days, frost, rain. " +
    "For a station: every year's count, whether it was measured whole, the year still running so far, the two halves of the record compared, and its most extreme day; for all: the stations side by side.",
  inputSchema: {
    type: "object",
    properties: {
      station: { type: "string", enum: [...weatherStations.map(({ code }) => code), "all"], default: weatherStations[0]?.code, description: `${weatherStations.map(({ code, name }) => `${code} ${name}`).join("; ")}; or all of them` },
      kind: { type: "string", enum: weatherPresets.map(({ id }) => id), default: weatherPresets[0]?.id, description: weatherPresets.map(({ id, name, atLeast, threshold, variable }) => `${id}: ${name}, ${weatherVariables[variable].name} ${atLeast ? "at least" : "below"} ${threshold} ${weatherVariables[variable].unit}`).join("; ") },
      threshold: { type: "number", description: "moves the kind's threshold, in its unit: °C, mm or mm/h" },
      months: { type: "array", items: { type: "integer", minimum: 1, maximum: 12 }, description: "the months to count in, January being 1; every month when left out" },
      from: { type: "integer", description: "the first year to list; the halves are always of the whole record" },
      to: { type: "integer", description: "the last year to list" },
    },
    required: [],
    additionalProperties: false,
  },
  readOnly: true,
  shows: true,
  async answer(input, { site, read }) {
    const asked = askedQuestion(input);
    if ("refused" in asked) return asked;
    const { codes, question, kind, from, to } = asked;
    const index = JSON.parse(await read("/data/weather/index.json")) as SourceIndex;
    const running = await runningFrom(read);
    const stations = await stationsAt(codes, read, running);
    if (stations.length === 0) return { refused: "the measurements did not arrive; ask again" };
    const said = questionInWords(question);
    const route = pageShowing(site, APP)?.route;
    const around = {
      source: index.attribution,
      refreshed: running && stations.some((station) => station.soFar) ? running.refreshed : index.refreshed,
      ...(route !== undefined && { route }),
    };

    if (codes.length === 1) {
      const [station] = stations;
      const counted = countedAt(station!, question, from, to);
      return {
        summary: oneInWords(counted, said, station!.soFar),
        data: { question: said, ...counted },
        ...around,
        show: { app: APP, values: { station: station!.code, kind, threshold: question.threshold, months: question.months.join(",") } },
      };
    }

    const side = stations.map((station) => countedAt(station, question, from, to)).sort((a, b) => (b.daysPerYearRecently ?? -1) - (a.daysPerYearRecently ?? -1));
    const ranked = side.map(({ station, daysPerYearRecently }) => `${station.name}, ${daysPerYearRecently ?? "no whole year"}${daysPerYearRecently === null ? "" : " a year"}`).join("; ");
    return {
      summary: `Most ${said}, in the second half of each record: ${ranked}.`,
      data: { question: said, stations: side.map(({ station, ...rest }) => ({ code: station.code, name: station.name, ...rest })) },
      ...around,
    };
  },
};
