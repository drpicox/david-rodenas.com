import type { Cell } from "./Table";

/** Two cells in order: numbers as numbers, anything else as words. */
export const cellOrder = (a: Cell | undefined, b: Cell | undefined) => (typeof a === "number" && typeof b === "number" ? a - b : String(a ?? "").localeCompare(String(b ?? "")));
