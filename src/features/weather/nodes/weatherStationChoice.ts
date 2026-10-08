import type { Editor } from "../../../platform/blueprint/NodeKind";
import { weatherGroups } from "../weatherGroups";

/** Which station a node reads: one of them by its name, or every one of a group, side by side — the network's stations, or the long series. */
export const weatherStationChoice: Editor = {
  kind: "choice",
  choices: weatherGroups.flatMap((group) => [...group.stations.map((station) => ({ value: station.code, label: station.name })), { value: group.every.name, label: group.every.label }]),
};
