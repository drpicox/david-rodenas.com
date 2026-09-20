import type { Still } from "../../platform/plugin/Feature";
import type { No2Station } from "./No2Station";
import { no2Stations } from "./no2Stations";
import { renderNo2Figure } from "./renderNo2Figure";
import { wholeRecord } from "./wholeRecord";

/** The figure a reader sees before choosing anything: the first station, its whole record, every day. */
export const no2Still: Still = (read) => {
  const station = JSON.parse(read(`/data/no2/${no2Stations[0]?.code}.json`)) as No2Station;
  return renderNo2Figure(station, wholeRecord(station));
};
