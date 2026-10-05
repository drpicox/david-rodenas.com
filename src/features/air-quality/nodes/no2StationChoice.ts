import type { Editor } from "../../../platform/blueprint/NodeKind";
import { no2Stations } from "../no2Stations";

/** Which measuring point a node reads: one of them by its name, or every one, side by side. */
export const no2StationChoice: Editor = {
  kind: "choice",
  choices: [...no2Stations.map((station) => ({ value: station.code, label: station.name })), { value: "all", label: "every measuring point" }],
};
