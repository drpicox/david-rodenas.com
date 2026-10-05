import type { Credit, Table } from "../Table";

/** The credits of several tables put together, each once: a table made of two owes both. */
export function mergedCredits(...tables: readonly Table[]): Credit[] {
  const seen = new Map<string, Credit>();
  for (const credit of tables.flatMap((table) => table.credits ?? [])) if (!seen.has(credit.said)) seen.set(credit.said, credit);
  return [...seen.values()];
}
