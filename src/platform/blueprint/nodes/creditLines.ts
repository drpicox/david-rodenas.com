import type { Table } from "../Table";

/** Who measured what a table holds, and when it was brought up to date, a line each: what every picture made of it says under it. */
export function creditLines(table: Table): string[] {
  return (table.credits ?? []).map((credit) => (credit.refreshed ? `${credit.said} Brought up to date ${credit.refreshed}.` : credit.said));
}
