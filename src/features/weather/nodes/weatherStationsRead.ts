import { optionalRead } from "../../../platform/blueprint/optionalRead";
import type { Credit } from "../../../platform/blueprint/Table";
import { readRunning } from "../../../platform/data/readRunning";
import type { SourceIndex } from "../../../platform/data/renderSourceLine";
import { withSoFar, type WithSoFar } from "../../../platform/data/withSoFar";
import { stationsNamed } from "../stationsNamed";
import type { WeatherStation } from "../WeatherStation";

/**
 * The stations a node asks for — one, or every one of a group — each with the
 * year still running among its years when its group keeps one, whether a
 * whole group was asked for, and who to credit for them: the source they are
 * kept from, and the day the copy was last brought up to date.
 */
export function weatherStationsRead(read: (path: string) => string, code: string): { stations: WithSoFar<WeatherStation>[]; every: boolean; credit: Credit } {
  const named = stationsNamed(code);
  if (!named) throw new Error(`station: there is no station ${code}`);
  const { group, codes } = named;
  const runningAt = `${group.directory}/running.json`;
  // Read outside readRunning, which forgives every failure: a year still on its way is to be waited for, not forgiven.
  const text = group.running ? optionalRead(read, runningAt) : null;
  const running = text === null ? null : readRunning<WeatherStation>(() => text, runningAt);
  const stations = codes.map((each) => withSoFar(JSON.parse(read(`${group.directory}/${each}.json`)) as WeatherStation, running, `${each}.json`));
  const index = JSON.parse(read(`${group.directory}/index.json`)) as SourceIndex;
  const refreshed = running && running.refreshed > index.refreshed ? running.refreshed : index.refreshed;
  return { stations, every: group.every.name === code, credit: { said: index.attribution, refreshed } };
}
