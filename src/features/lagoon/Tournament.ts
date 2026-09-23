import type { Fisher } from "./Fisher";
import { playRound } from "./playRound";
import type { Round } from "./Round";

/**
 * A season on one lagoon: the same bots, round after round, each round
 * starting with the lagoon restocked and every bot shown what happened in
 * the rounds before. A bot whose orders cannot be read — it threw, or did
 * not answer with numbers — rests that round, and the board says why; a
 * visitor's mistake cannot stop the season.
 */
export class Tournament {
  readonly rounds: Round[] = [];
  readonly errors: Record<string, string> = {};

  constructor(
    readonly fish: number,
    readonly weeks: number,
    private readonly fishers: readonly Fisher[],
  ) {}

  get names(): string[] {
    return this.fishers.map((fisher) => fisher.name);
  }

  play(): Round {
    const orders = Object.fromEntries(this.fishers.map((fisher) => [fisher.name, this.ordersOf(fisher)]));
    const round = playRound(this.fish, this.weeks, orders);
    this.rounds.push(round);
    return round;
  }

  scores(): Record<string, number> {
    return Object.fromEntries(this.names.map((name) => [name, this.rounds.reduce((sum, round) => sum + (round.totals[name] ?? 0), 0)]));
  }

  private ordersOf(fisher: Fisher): number[] {
    try {
      const orders = fisher.orders(this.fish, this.weeks, this.names, fisher.name, this.rounds);
      if (!Array.isArray(orders) || orders.some((order) => typeof order !== "number" || Number.isNaN(order))) throw new Error("orders must be an array of numbers, one a week");
      delete this.errors[fisher.name];
      return Array.from({ length: this.weeks }, (_, week) => orders[week] ?? 0);
    } catch (error) {
      this.errors[fisher.name] = error instanceof Error ? error.message : String(error);
      return new Array<number>(this.weeks).fill(0);
    }
  }
}
