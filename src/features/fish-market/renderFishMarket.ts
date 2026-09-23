import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { DutchAuction } from "./DutchAuction";

/** Enough of the log to see a run of sales; the standings say the rest. */
const SALES_SHOWN = 12;

const credits = (amount: number) => Math.round(amount).toString();
const percent = (margin: number | null) => (margin === null ? "—" : margin === Infinity ? "∞" : `${Math.round(margin * 100)}%`);

/**
 * The board at the back of the room: the next lot and what each buyer is
 * asking for it, the standings by profit, and the latest sales. The build
 * writes it for the moment before the first lot; the browser for every
 * moment after.
 */
export function renderFishMarket(auction: DutchAuction): string {
  const lot = auction.next;
  const demands = auction.demands();
  const standings = [...auction.standings()].sort((a, b) => b.profit - a.profit);
  const most = Math.max(1, ...standings.map((standing) => Math.abs(standing.profit)));

  const next = lot
    ? `<p class="lot">Next on the floor: <b>a box of ${escapeHtml(lot.kind)}</b>, which resells for ${credits(lot.value)}. The price starts at ${credits(lot.value * 1.5)} and falls.</p>`
    : `<p class="lot">The floor is empty.</p>`;

  const rows = standings
    .map(({ name, lots, spent, value, profit, credit, error }) => {
      const asks = error ? `<td class="asks error" colspan="5">${escapeHtml(error)}</td>` : `<td class="asks">${percent(demands[name] ?? null)}</td>`;
      return (
        `<tr${profit < 0 ? ' class="loss"' : ""}><th scope="row">${escapeHtml(name)}</th>${asks}` +
        (error
          ? ""
          : `<td>${lots} lot${lots === 1 ? "" : "s"}</td><td>${credits(spent)}</td><td>${credits(value)}</td><td>${credits(credit)}</td>`) +
        `<td class="profit"><span class="bar" style="--p:${(Math.abs(profit) / most).toFixed(3)}"></span>${credits(profit)}</td></tr>`
      );
    })
    .join("");
  const board =
    `<table class="board"><thead><tr><th>buyer</th><th>asks</th><th>holds</th><th>spent</th><th>worth</th><th>credit</th><th>profit</th></tr></thead>` +
    `<tbody>${rows}</tbody></table>`;

  const turns = auction.turns;
  const log = turns.length
    ? `<ol class="sales" reversed start="${turns.length}">${[...turns]
        .reverse()
        .slice(0, SALES_SHOWN)
        .map(({ sale: { lot: sold, buyer, price }, bids, short }) => {
          const went = price === null || buyer === null ? `<i>withdrawn</i>` : `sold at <b>${credits(price)}</b>, a margin of ${percent((sold.value - price) / price)}`;
          const ready = Object.entries(bids)
            .map(([name, bid]) => {
              if (bid === null) return `${escapeHtml(name)} —`;
              const who = name === buyer ? `<b>${escapeHtml(name)}</b>` : escapeHtml(name);
              return short.includes(name) ? `<s title="more than it had">${who} at ${credits(bid)}</s>` : `${who} at ${credits(bid)}`;
            })
            .join(", ");
          return `<li><span class="went">${escapeHtml(sold.kind)}, ${credits(sold.value)}: ${went}.</span> <span class="ready">Ready to shout: ${ready}.</span></li>`;
        })
        .join("")}</ol>`
    : "";

  return `<div class="fish-market">${next}${board}${log}</div>`;
}
