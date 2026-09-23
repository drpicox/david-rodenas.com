import type { Week } from "./Week";

/** A round, played: the orders each bot gave before it, and the weeks as they went. */
export interface Round {
  readonly start: number;
  readonly orders: Readonly<Record<string, readonly number[]>>;
  readonly weeks: readonly Week[];
  readonly totals: Readonly<Record<string, number>>;
}
