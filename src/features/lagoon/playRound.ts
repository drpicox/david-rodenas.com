import type { Round } from "./Round";
import type { Week } from "./Week";

/**
 * The lagoon of the LS1 lab, rule for rule. Each week the boats go out with
 * their orders and the lagoon serves the smallest order first: everyone who
 * asked for that many gets it, or an equal split of what is there if it does
 * not stretch; then the next smallest, until the orders or the fish run out.
 * Then the fish that are left breed, half as many again, rounded down. An
 * order of 0 is a week's rest.
 */
export function playRound(fish: number, weekCount: number, orders: Readonly<Record<string, readonly number[]>>): Round {
  const names = Object.keys(orders);
  const weeks: Week[] = [];
  const totals: Record<string, number> = Object.fromEntries(names.map((name) => [name, 0]));
  let left = fish;
  for (let week = 0; week < weekCount; week += 1) {
    const caught: Record<string, number> = Object.fromEntries(names.map((name) => [name, 0]));
    const wanted = names.map((name) => ({ name, order: Math.max(0, Math.floor(orders[name]?.[week] ?? 0)) })).filter(({ order }) => order > 0);
    for (const order of [...new Set(wanted.map(({ order }) => order))].sort((a, b) => a - b)) {
      const boats = wanted.filter((boat) => boat.order === order);
      const share = Math.min(Math.floor(left / boats.length), order);
      for (const { name } of boats) {
        caught[name] = share;
        totals[name] = totals[name]! + share;
      }
      left -= share * boats.length;
    }
    left += Math.floor(left / 2);
    weeks.push({ fish: left, caught });
  }
  return { start: fish, orders, weeks, totals };
}
