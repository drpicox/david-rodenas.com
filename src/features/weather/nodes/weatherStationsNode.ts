import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { weatherStations } from "../weatherStations";

/** The weather stations themselves: where each is, how high, and what is around it — to set beside what they measured. */
export const weatherStationsNode: NodeKind = {
  name: "weather-stations",
  title: "Weather stations",
  role: "source",
  shelf: "Weather",
  summary: "The weather stations themselves: their code, name, town, height above the sea, and what is around them.",
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
      ],
      rows: weatherStations.map((station) => ({ station: station.code, name: station.name, municipality: station.municipality, altitude: station.altitude, setting: station.setting })),
    };
    return { outputs: { table } };
  },
};
