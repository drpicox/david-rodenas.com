import { alone } from "./alone";
import type { Fisher } from "./Fisher";

/**
 * The strategies the starter came with, so a student had something to beat:
 * one that rests, one that takes a fish a week, one that takes the square of
 * the week, and one that takes a share of what it believes is there.
 */
export const starters: Readonly<Record<"rest" | "one" | "power", Fisher>> & { percent(share: number): Fisher } = {
  rest: { name: "Rest", orders: (_fish, weeks) => new Array<number>(weeks).fill(0) },
  one: { name: "One", orders: (_fish, weeks) => new Array<number>(weeks).fill(1) },
  power: { name: "Power", orders: (_fish, weeks) => Array.from({ length: weeks }, (_, week) => week * week) },
  percent: (share) => ({
    name: `${Math.round(share * 100)}%`,
    orders: (fish, weeks) => alone(fish, weeks, (now) => now * share),
  }),
};
