import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { weatherGroups } from "../weatherGroups";

/** The weather stations themselves, and the long series: where each is, how high, what is around it, and which of the Meteocat's records it is — to set beside what they measured. */
export const weatherStationsNode: NodeKind = {
  name: "weather-stations",
  title: "Weather stations",
  role: "source",
  shelf: "Weather",
  summary: "The weather stations themselves, and the long series: their code, name, town, height above the sea, what is around them, and which kind of record each is.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: () => {
    const table: Table = {
      columns: [
        { name: "station", kind: "text", key: true },
        { name: "name", kind: "text" },
        { name: "municipality", kind: "text" },
        { name: "altitude", kind: "number", unit: "m" },
        { name: "setting", kind: "text" },
        { name: "record", kind: "text", about: "an automatic station of the network, or one of the Meteocat's long series, checked and homogenised since 1950" },
      ],
      rows: weatherGroups.flatMap((group) =>
        group.stations.map((station) => ({ station: station.code, name: station.name, municipality: station.municipality, altitude: station.altitude, setting: station.setting, record: group.label })),
      ),
    };
    return { outputs: { table } };
  },
};
