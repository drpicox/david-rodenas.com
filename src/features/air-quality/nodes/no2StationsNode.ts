import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { no2Stations } from "../no2Stations";

/** The measuring points themselves: what the network says each measures — traffic, or the background away from it — and where. */
export const no2StationsNode: NodeKind = {
  name: "no2-stations",
  title: "Measuring points",
  role: "source",
  shelf: "Air",
  summary: "The NO2 measuring points themselves: their code, name, and what the network says each measures — traffic, or the background — and where.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: () => {
    const table: Table = {
      columns: [
        { name: "station", kind: "text", key: true },
        { name: "name", kind: "text" },
        { name: "kind", kind: "text", about: "traffic, or the background away from it" },
        { name: "area", kind: "text" },
      ],
      rows: no2Stations.map((station) => ({ station: station.code, name: station.name, kind: station.kind, area: station.area })),
    };
    return { outputs: { table } };
  },
};
