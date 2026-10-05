import { optionalRead } from "../../../platform/blueprint/optionalRead";
import type { Credit } from "../../../platform/blueprint/Table";
import { readRunning } from "../../../platform/data/readRunning";
import type { SourceIndex } from "../../../platform/data/renderSourceLine";
import { withSoFar, type WithSoFar } from "../../../platform/data/withSoFar";
import type { WeatherStation } from "../WeatherStation";
import { weatherStations } from "../weatherStations";

const RUNNING = "/data/weather/running.json";

/**
 * The stations a node asks for — one, or every one — each with the year still
 * running among its years when there is one, and who to credit for them:
 * the network, and the day the copy was last brought up to date.
 */
export function weatherStationsRead(read: (path: string) => string, code: string): { stations: WithSoFar<WeatherStation>[]; credit: Credit } {
  const codes = code === "all" ? weatherStations.map((station) => station.code) : [code];
  if (!weatherStations.some((station) => station.code === codes[0])) throw new Error(`station: there is no station ${code}`);
  // Read outside readRunning, which forgives every failure: a year still on its way is to be waited for, not forgiven.
  const text = optionalRead(read, RUNNING);
  const running = text === null ? null : readRunning<WeatherStation>(() => text, RUNNING);
  const stations = codes.map((each) => withSoFar(JSON.parse(read(`/data/weather/${each}.json`)) as WeatherStation, running, `${each}.json`));
  const index = JSON.parse(read("/data/weather/index.json")) as SourceIndex;
  const refreshed = running && running.refreshed > index.refreshed ? running.refreshed : index.refreshed;
  return { stations, credit: { said: index.attribution, refreshed } };
}
