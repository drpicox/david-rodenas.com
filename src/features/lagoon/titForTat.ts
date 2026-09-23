import { alone } from "./alone";
import type { Fisher } from "./Fisher";
import type { Round } from "./Round";

/** A full share of the lagoon, as the starter counted it: what is there over how many are on it, rounded up. */
const fullShare = (fish: number, bots: number) => Math.ceil(fish / bots);

/**
 * The strategy the starter shipped as the one worth beating. With nobody it
 * distrusts on the lagoon it rests every week but the last and then takes
 * one share of everything that grew — the most a lagoon can give, if all
 * do it. Once someone has taken a full share or more in the first week of a
 * round, it is a traitor for good, and from then on the strategy takes a
 * full share every week itself, so that the traitor cannot grow rich on its
 * patience. Two of these on one lagoon cooperate; one of these with a greedy
 * bot starves it.
 */
export function titForTat(name = "Tit for tat"): Fisher {
  const traitors = new Set<string>();
  return {
    name,
    orders(fish, weeks, bots, me, before: readonly Round[]) {
      for (const round of before) {
        for (const other of Object.keys(round.orders)) {
          if (other !== me && (round.orders[other]?.[0] ?? 0) >= fullShare(round.start, bots.length)) traitors.add(other);
        }
      }
      if (bots.some((bot) => bot !== me && traitors.has(bot))) return alone(fish, weeks, (now) => fullShare(now, bots.length));
      let grown = fish;
      for (let week = 1; week < weeks; week += 1) grown += Math.floor(grown / 2);
      return [...new Array<number>(weeks - 1).fill(0), Math.floor(grown / bots.length)];
    },
  };
}
