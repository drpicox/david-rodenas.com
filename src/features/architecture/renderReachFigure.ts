import { fixed } from "../../platform/charts/fixed";
import { niceTicks } from "../../platform/charts/niceTicks";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { percent } from "./percent";
import { plural } from "./plural";
import { propagationCostOf } from "./propagationCostOf";
import { reachedByOf } from "./reachedByOf";
import type { Snapshot } from "./Snapshot";

const W = 600;
const H = 150;
const PAD = { top: 12, right: 12, bottom: 22, left: 40 };
const NAMED = 3;
const kept = new WeakMap<Snapshot, number>();
/** Each snapshot's cost, worked out once: the line is drawn again at every commit the page is taken to. */
const costOf = (snapshot: Snapshot) => {
  const found = kept.get(snapshot);
  if (found !== undefined) return found;
  const cost = propagationCostOf(snapshot);
  kept.set(snapshot, cost);
  return cost;
};

/**
 * How far a change could reach, commit by commit: the design's propagation
 * cost — the share of the source a change to one file could reach, on
 * average — at every commit up to the one shown, over the whole history's
 * width; and the files a change to which could reach the most now.
 */
export function renderReachFigure(snapshots: readonly Snapshot[], at: number): string {
  const shown = snapshots.slice(0, at + 1);
  const costs = shown.map(costOf);
  const top = Math.max(0.01, ...costs);
  const x = (index: number) => PAD.left + (index / Math.max(1, snapshots.length - 1)) * (W - PAD.left - PAD.right);
  const y = (cost: number) => PAD.top + (1 - cost / top) * (H - PAD.top - PAD.bottom);
  const points = costs.map((cost, index) => `${fixed(x(index))},${fixed(y(cost))}`).join(" ");
  // Round numbers up the side, in hundredths: a share of 9.4% says less than one of 10%.
  const ticks = niceTicks(Math.round(top * 1000) / 10).map((tick) => tick / 100).map((tick) => `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${fixed(y(tick))}" y2="${fixed(y(tick))}"/><text x="${PAD.left - 6}" y="${fixed(y(tick) + 3)}" text-anchor="end">${percent(tick, 1)}</text>`).join("");
  const svg =
    `<svg class="reach" viewBox="0 0 ${W} ${H}" role="img" aria-label="The share of the source a change to one file could reach, commit by commit">` +
    `${ticks}<polyline class="reach" points="${points}"/>` +
    `<text x="${fixed(x(0))}" y="${H - 6}">the first commit</text><text x="${fixed(x(snapshots.length - 1))}" y="${H - 6}" text-anchor="end">the last</text></svg>`;
  const now = shown.at(-1) ?? { modules: [], dependencies: [] };
  const pathOf = new Map(now.modules.map((module) => [module.id, module.path]));
  const reaching = [...reachedByOf(now)].sort((a, b) => b[1] - a[1] || (pathOf.get(a[0]) ?? "").localeCompare(pathOf.get(b[0]) ?? "")).slice(0, NAMED);
  const named = reaching.map(([id, count]) => `${pathOf.get(id)}, whose change could reach ${plural(count, "file")}`);
  const said =
    `In theory a change to one file could reach ${percent(costs.at(-1) ?? 0, 1)} of the source, on average; at the first commit, ${percent(costs[0] ?? 0, 1)}. ` +
    `The farthest reaching: ${named.length > 1 ? `${named.slice(0, -1).join("; ")}; and ${named.at(-1)}` : (named[0] ?? "none")}.`;
  return `<figure class="changes-figure">${svg}<figcaption>${escapeHtml(said)}</figcaption></figure>`;
}
