import type { Round } from "./Round";

/**
 * A bot's whole mind: given the lagoon, the weeks ahead and who else is on
 * it, its orders for the round — one number a week, 0 to rest — all at once,
 * before the round starts. Nobody sees what the others do until the round is
 * over; then everyone is shown it, and may learn.
 */
export interface Fisher {
  readonly name: string;
  orders(fish: number, weeks: number, bots: readonly string[], me: string, before: readonly Round[]): readonly number[];
}
