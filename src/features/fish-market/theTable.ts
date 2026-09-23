import type { Bidder } from "./Bidder";
import { fixedMargin } from "./fixedMargin";
import { planner } from "./planner";
import { vicente } from "./vicente";
import { wanda } from "./wanda";

/**
 * Who sits at the table: two buyers that made up their minds before the
 * auction — one waiting for half price, one taking the first 5% — and the
 * three agents of December 2000, in the order they were written.
 */
export function theTable(greed = 0.9): Bidder[] {
  return [fixedMargin("Patient", 1), fixedMargin("Hasty", 0.05), vicente(greed), wanda(), planner()];
}
