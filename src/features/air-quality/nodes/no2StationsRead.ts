import { optionalRead } from "../../../platform/blueprint/optionalRead";
import type { Credit } from "../../../platform/blueprint/Table";
import { readRunning } from "../../../platform/data/readRunning";
import type { SourceIndex } from "../../../platform/data/renderSourceLine";
import { withSoFar, type WithSoFar } from "../../../platform/data/withSoFar";
import type { No2Station } from "../No2Station";
import { no2Stations } from "../no2Stations";

const RUNNING = "/data/no2/running.json";

/**
 * The measuring points a node asks for — one, or every one — each with the
 * year still running among its years when there is one, and who to credit:
 * the network, and the day the copy was last brought up to date.
 */
export function no2StationsRead(read: (path: string) => string, code: string): { stations: WithSoFar<No2Station>[]; credit: Credit } {
  const codes = code === "all" ? no2Stations.map((station) => station.code) : [code];
  if (!no2Stations.some((station) => station.code === codes[0])) throw new Error(`station: there is no measuring point ${code}`);
  // Read outside readRunning, which forgives every failure: a year still on its way is to be waited for, not forgiven.
  const text = optionalRead(read, RUNNING);
  const running = text === null ? null : readRunning<No2Station>(() => text, RUNNING);
  const stations = codes.map((each) => withSoFar(JSON.parse(read(`/data/no2/${each}.json`)) as No2Station, running, `${each}.json`));
  const index = JSON.parse(read("/data/no2/index.json")) as SourceIndex;
  const refreshed = running && running.refreshed > index.refreshed ? running.refreshed : index.refreshed;
  return { stations, credit: { said: index.attribution, refreshed } };
}
