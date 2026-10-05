import { numberSaid } from "./numberSaid";
import type { PinType } from "./PinType";
import type { Table } from "./Table";

const SHOWN = 6;

const flagOf = (value: unknown) => value === true || value === "yes" || value === "true" || value === "on" || value === 1;

function tableSaid(value: unknown): string {
  const { rows, columns } = value as Table;
  const names = columns.slice(0, SHOWN).map((column) => column.name).join(", ");
  const more = columns.length > SHOWN ? ` +${columns.length - SHOWN}` : "";
  return `${rows.length} ${rows.length === 1 ? "row" : "rows"} · ${names}${more}`;
}

/**
 * What flows along the wires of every blueprint, whatever the features
 * bring: a number, some words, yes or no, a table, and the value of a dial,
 * which takes the shape of whatever it is wired into.
 */
export const coreTypes: readonly PinType[] = [
  { name: "number", label: "a number", colour: "--bp-number", describe: (value) => numberSaid(Number(value)) },
  { name: "text", label: "some words", colour: "--bp-text", describe: (value) => `“${String(value)}”` },
  { name: "flag", label: "yes or no", colour: "--bp-flag", describe: (value) => (flagOf(value) ? "yes" : "no") },
  { name: "table", label: "a table", colour: "--bp-table", describe: tableSaid },
  {
    name: "value",
    label: "a dial's value",
    colour: "--bp-value",
    describe: (value) => (typeof value === "number" ? numberSaid(value) : String(value)),
    becomes: { number: (value) => Number(value), text: (value) => String(value), flag: flagOf },
  },
];
