import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { seaPoints } from "../seaPoints";

/** The sea's points themselves: what each is called, and where its cell's centre is, to name the rows of every point at once. */
export const seaPointsNode: NodeKind = {
  name: "sea-points",
  title: "Sea points",
  role: "source",
  shelf: "Sea",
  summary: "The four cells of sea off the Catalan coast the site keeps, north to south: their names and where they are.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: () => ({
    outputs: {
      table: {
        columns: [
          { name: "point", kind: "text", key: true },
          { name: "name", kind: "text" },
          { name: "lat", kind: "number", unit: "°N", about: "the latitude of the cell's centre" },
          { name: "lon", kind: "number", unit: "°E", about: "the longitude of the cell's centre" },
        ],
        rows: seaPoints.map((point) => ({ point: point.code, name: point.name, lat: point.lat, lon: point.lon })),
        credits: [],
      } satisfies Table,
    },
  }),
};
