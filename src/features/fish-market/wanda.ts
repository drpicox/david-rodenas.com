import type { Bidder } from "./Bidder";
import type { Sale } from "./Sale";
import { marketMargin } from "./marketMargin";

const GREED = 0.98;
const WON = 1.05;
const UNDERCUT = 0.95;

const marginOf = (sale: Sale) => (sale.lot.value - sale.price!) / sale.price!;

/** What a buyer has made per unit spent, over everything it bought. */
function gainOf(name: string, sales: readonly Sale[]): number {
  const own = sales.filter((sale) => sale.buyer === name);
  const paid = own.reduce((sum, sale) => sum + sale.price!, 0);
  return paid > 0 ? (own.reduce((sum, sale) => sum + sale.lot.value, 0) - paid) / paid : 0;
}

/**
 * The agent of 10 December 2000. She stands on the market's margin like
 * Vicente, believing the others will spend 98% rather than 90%, and corrects
 * herself as the auction goes: 5% choosier each time she wins, 5% less each
 * time a rival who is doing at least as well takes a lot at a margin she
 * would have accepted, because somebody is buying under her. The original
 * kept a running model of every other buyer for this; the sales so far say
 * the same. It also carried a margin learnt per kind of fish, meant to cap
 * the market's — but the one line that chose between them returned the
 * market's on both branches, so the kinds never spoke, and they do not here.
 */
export function wanda(name = "Wanda"): Bidder {
  return {
    name,
    demands(_lot, market, me) {
      const base = marketMargin(market, GREED);
      const mine = gainOf(me, market.sales);
      let factor = 1;
      for (const sale of market.sales) {
        if (sale.buyer === null) continue;
        if (sale.buyer === me) factor *= WON;
        else if (gainOf(sale.buyer, market.sales) >= mine && marginOf(sale) >= base) factor *= UNDERCUT;
      }
      return base * factor;
    },
  };
}
