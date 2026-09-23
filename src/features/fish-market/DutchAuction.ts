import type { Bidder } from "./Bidder";
import type { Lot } from "./Lot";
import type { Market } from "./Market";
import type { Sale } from "./Sale";
import type { Standing } from "./Standing";

/** Where the auctioneer starts, how fast he comes down, and where he gives up, all relative to the resale value. */
const OPENING = 1.5;
const STEP = 0.02;
const FLOOR = 0.25;

interface Buyer {
  readonly bidder: Bidder;
  credit: number;
  readonly won: Lot[];
  error: string | null;
}

/**
 * The fish market of the AIA lab, as a Dutch auction: the price of each lot
 * starts above its resale value and falls, the first buyer to shout takes it
 * at that price, and a lot nobody wants is withdrawn. The real one restarted
 * the round higher when two shouted at once; here a coin decides. A bidder
 * that throws is taken to have said nothing, so a visitor's own agent cannot
 * stop the auction — only lose it.
 */
export class DutchAuction {
  private readonly buyers: Buyer[];
  private readonly remaining: Lot[];
  private readonly sold: Sale[] = [];

  constructor(
    lots: readonly Lot[],
    bidders: readonly Bidder[],
    private readonly credit: number,
    private readonly random: () => number,
  ) {
    this.remaining = [...lots];
    this.buyers = bidders.map((bidder) => ({ bidder, credit, won: [], error: null }));
  }

  get over(): boolean {
    return this.remaining.length === 0;
  }

  get next(): Lot | undefined {
    return this.remaining[0];
  }

  get market(): Market {
    return {
      lots: this.remaining,
      credits: Object.fromEntries(this.buyers.map((buyer) => [buyer.bidder.name, buyer.credit])),
      sales: this.sold,
    };
  }

  /** What each buyer would demand for the next lot, as the board shows it before the price starts to fall. */
  demands(): Record<string, number | null> {
    const lot = this.next;
    return Object.fromEntries(this.buyers.map((buyer) => [buyer.bidder.name, lot ? this.demandOf(buyer, lot) : null]));
  }

  sell(): Sale {
    const lot = this.remaining.shift();
    if (!lot) throw new Error("the floor is empty");
    const demands = this.buyers.map((buyer) => this.demandOf(buyer, lot));
    for (let price = lot.value * OPENING; price >= lot.value * FLOOR; price -= lot.value * STEP) {
      const margin = (lot.value - price) / price;
      const shouting = this.buyers.filter((buyer, index) => buyer.credit >= price && margin >= (demands[index] ?? Infinity));
      if (shouting.length === 0) continue;
      const winner = shouting[Math.min(shouting.length - 1, Math.floor(this.random() * shouting.length))]!;
      winner.credit -= price;
      winner.won.push(lot);
      return this.record({ lot, buyer: winner.bidder.name, price });
    }
    return this.record({ lot, buyer: null, price: null });
  }

  standings(): Standing[] {
    return this.buyers.map(({ bidder, credit, won, error }) => {
      const value = won.reduce((sum, lot) => sum + lot.value, 0);
      const spent = this.credit - credit;
      return { name: bidder.name, credit0: this.credit, credit, spent, lots: won.length, value, profit: value - spent, error };
    });
  }

  private record(sale: Sale): Sale {
    this.sold.push(sale);
    return sale;
  }

  private demandOf(buyer: Buyer, lot: Lot): number | null {
    try {
      const demanded = buyer.bidder.demands(lot, this.market, buyer.bidder.name);
      if (typeof demanded !== "number" || Number.isNaN(demanded)) throw new Error(`demanded ${String(demanded)}, not a margin`);
      buyer.error = null;
      return demanded;
    } catch (error) {
      buyer.error = error instanceof Error ? error.message : String(error);
      return null;
    }
  }
}
