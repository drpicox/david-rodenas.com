import type { Bidder } from "./Bidder";
import { marketMargin } from "./marketMargin";

const GREED = 0.9;
/** How far above the market's margin the histogram reaches, and in how many bins. */
const REACH = 3;
const BINS = 10;

/**
 * The agent handed in on 15 December 2000 — `Control`, `Planificador` and
 * `DistribuidorLotes` — read back from the compiled classes, since the source
 * did not survive. Where Wanda corrected her margin after the fact, this one
 * plans it. It keeps a histogram of the value sold so far by the margin it
 * went at, from the market's margin up, and assumes the fish still on the
 * floor will go the same way. Then it walks the bins from the best margin
 * down, adding up what it would cost to buy the fish expected in each, until
 * that reaches the credit it has left: that bin's margin is the most it can
 * demand and still spend all its money. Until anything has sold, and whenever
 * it has more money than that, it is Vicente.
 */
export function planner(name = "Planner"): Bidder {
  return {
    name,
    demands(_lot, market, me) {
      const floor = marketMargin(market, GREED);
      const width = (floor * (REACH - 1)) / BINS;
      const edge = (bin: number) => floor + bin * width;
      const binOf = (margin: number) => Math.max(0, Math.min(BINS - 1, Math.floor((margin - floor) / width)));

      const histogram = new Array<number>(BINS).fill(0);
      for (const sale of market.sales) {
        if (sale.price === null) continue;
        const bin = binOf((sale.lot.value - sale.price) / sale.price);
        histogram[bin] = histogram[bin]! + sale.lot.value;
      }
      const seen = histogram.reduce((sum, value) => sum + value, 0);
      if (seen === 0) return floor;

      const fish = market.lots.reduce((sum, lot) => sum + lot.value, 0);
      const credit = market.credits[me] ?? 0;
      let cost = 0;
      for (let bin = BINS - 1; bin >= 0; bin -= 1) {
        cost += (fish * histogram[bin]!) / seen / (1 + edge(bin));
        if (cost >= credit) return edge(bin);
      }
      return floor;
    },
  };
}
