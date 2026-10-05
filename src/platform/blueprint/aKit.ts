import { coreNodes } from "./coreNodes";
import { coreTypes } from "./coreTypes";
import { type Kit, kitOf } from "./kitOf";
import type { NodeKind } from "./NodeKind";
import type { Table } from "./Table";

/** A source made for tests: the years from one to another, and the nights each had, which grow by two a year. */
const nightsNode: NodeKind = {
  name: "nights",
  title: "Nights",
  role: "source",
  shelf: "Test",
  summary: "the nights of each year, made up for a test",
  inputs: [
    { name: "from", label: "from", type: "number", initial: 2000, editor: { kind: "number", min: 1990, max: 2030, step: 1 } },
    { name: "place", label: "place", type: "text", initial: "WU", editor: { kind: "choice", choices: [{ value: "WU", label: "Badalona" }, { value: "X4", label: "el Raval" }] } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: ({ from }) => {
    const rows = Array.from({ length: 5 }, (_, at) => ({ year: Number(from) + at, nights: 10 + 2 * at }));
    return { outputs: { table: { columns: [{ name: "year", kind: "number", key: true }, { name: "nights", kind: "number", unit: "nights" }], rows, credits: [{ said: "Made up." }] } satisfies Table } };
  },
};

/** The nodes every blueprint has, and one source made up for tests. */
export const aKit: Kit = kitOf([...coreNodes, nightsNode], coreTypes);
