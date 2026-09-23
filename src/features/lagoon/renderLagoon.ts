import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { Tournament } from "./Tournament";

/**
 * The board by the lagoon: the season's standings, and the last round week
 * by week — what each bot caught, and what was left in the water to breed.
 * The build writes it before anyone has been out; the browser after each round.
 */
export function renderLagoon(season: Tournament): string {
  const last = season.rounds[season.rounds.length - 1];
  const scores = season.scores();
  const most = Math.max(1, ...Object.values(scores));
  const rows = [...season.names]
    .sort((a, b) => scores[b]! - scores[a]!)
    .map((name) => {
      const error = season.errors[name];
      return (
        `<tr><th scope="row">${escapeHtml(name)}</th>` +
        (error ? `<td class="error" colspan="2">${escapeHtml(error)}</td>` : `<td>${last?.totals[name] ?? 0}</td><td class="profit"><span class="bar" style="--p:${(scores[name]! / most).toFixed(3)}"></span>${scores[name]}</td>`) +
        `</tr>`
      );
    })
    .join("");
  const rounds = season.rounds.length;
  const standings =
    `<table class="board"><caption>${rounds === 0 ? "The season has not started" : `After ${rounds} round${rounds === 1 ? "" : "s"}`}</caption>` +
    `<thead><tr><th>bot</th><th>last round</th><th>season</th></tr></thead><tbody>${rows}</tbody></table>`;

  if (!last) return `<div class="lagoon"><p class="lot">The lagoon has <b>${season.fish} fish</b>, and ${season.weeks} weeks ahead. Nobody has been out yet.</p>${standings}</div>`;

  const weeks = last.weeks.map((_, week) => `<th>${week + 1}</th>`).join("");
  const peak = Math.max(1, ...last.weeks.map((week) => week.fish));
  const water = last.weeks.map((week) => `<td><span class="fish" style="--p:${(week.fish / peak).toFixed(3)}"></span>${week.fish}</td>`).join("");
  const boats = season.names
    .map((name) => {
      const cells = last.weeks
        .map((week, index) => {
          const order = last.orders[name]?.[index] ?? 0;
          const caught = week.caught[name] ?? 0;
          return `<td${order > caught ? ' class="short"' : ""} title="asked for ${order}">${caught}</td>`;
        })
        .join("");
      return `<tr><th scope="row">${escapeHtml(name)}</th>${cells}<td class="total">${last.totals[name]}</td></tr>`;
    })
    .join("");
  const round =
    `<table class="weeks"><caption>Round ${rounds}, week by week: what each bot caught, and what was left in the lagoon</caption>` +
    `<thead><tr><th>week</th>${weeks}<th>total</th></tr></thead>` +
    `<tbody>${boats}<tr class="water"><th scope="row">in the lagoon</th>${water}<td></td></tr></tbody></table>`;

  return `<div class="lagoon">${round}${standings}</div>`;
}
