import { readRunning } from "../../platform/data/readRunning";
import { renderSourceLine, type SourceIndex } from "../../platform/data/renderSourceLine";
import { withSoFar } from "../../platform/data/withSoFar";
import type { Still } from "../../platform/plugin/Feature";
import type { No2Station } from "./No2Station";
import { no2Stations } from "./no2Stations";
import { renderNo2Figure } from "./renderNo2Figure";
import { wholeRecord } from "./wholeRecord";

/** The figure a reader sees before choosing anything: the first station, its whole record, every day, the year still running with it when there is one. */
export const no2Still: Still = (read) => {
  const file = `${no2Stations[0]?.code}.json`;
  const running = readRunning<No2Station>(read, "/data/no2/running.json");
  const station = withSoFar(JSON.parse(read(`/data/no2/${file}`)) as No2Station, running, file);
  const index = JSON.parse(read("/data/no2/index.json")) as SourceIndex;
  return renderNo2Figure(station, wholeRecord(station)) + renderSourceLine(index, running);
};
