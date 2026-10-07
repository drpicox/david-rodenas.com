import { optionalRead } from "../../../platform/blueprint/optionalRead";
import type { Credit } from "../../../platform/blueprint/Table";
import { readRunning } from "../../../platform/data/readRunning";
import type { SourceIndex } from "../../../platform/data/renderSourceLine";
import { withSoFar, type WithSoFar } from "../../../platform/data/withSoFar";
import type { SeaFile } from "../SeaPoint";
import { seaPoints } from "../seaPoints";

const RUNNING = "/data/sea/running.json";

/**
 * The points a node asks for — one, or every one — each with the year still
 * running among its years when there is one, and who to credit for them:
 * NOAA, and the day the copy was last brought up to date.
 */
export function seaPointsRead(read: (path: string) => string, code: string): { points: WithSoFar<SeaFile>[]; credit: Credit } {
  const codes = code === "all" ? seaPoints.map((point) => point.code) : [code];
  if (!seaPoints.some((point) => point.code === codes[0])) throw new Error(`off: there is no point ${code}`);
  // Read outside readRunning, which forgives every failure: a year still on its way is to be waited for, not forgiven.
  const text = optionalRead(read, RUNNING);
  const running = text === null ? null : readRunning<SeaFile>(() => text, RUNNING);
  const points = codes.map((each) => withSoFar(JSON.parse(read(`/data/sea/${each}.json`)) as SeaFile, running, `${each}.json`));
  const index = JSON.parse(read("/data/sea/index.json")) as SourceIndex;
  const refreshed = running && running.refreshed > index.refreshed ? running.refreshed : index.refreshed;
  return { points, credit: { said: index.attribution, refreshed } };
}
