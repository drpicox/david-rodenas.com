import type { Editor } from "../../../platform/blueprint/NodeKind";
import { weatherStations } from "../weatherStations";

/** Which station a node reads: one of them by its name, or every one, side by side. */
export const weatherStationChoice: Editor = {
  kind: "choice",
  choices: [...weatherStations.map((station) => ({ value: station.code, label: station.name })), { value: "all", label: "every station" }],
};
