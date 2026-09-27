import type { Metrics } from "./Metrics";

const W = 600;
const H = 60;
const PAD = 4;

/**
 * Two lines across the whole history, the files and the arrows between boxes,
 * each on its own scale so both show their shape; a mark on the commit being
 * shown; and a red band under every commit that had boxes in a circle.
 */
export function renderMetricsSparks(history: readonly Metrics[], at: number): string {
  const x = (index: number) => PAD + (index / Math.max(1, history.length - 1)) * (W - PAD * 2);
  const line = (value: (metrics: Metrics) => number, className: string) => {
    const top = Math.max(1, ...history.map(value));
    const points = history.map((metrics, index) => `${x(index).toFixed(1)},${(H - PAD - (value(metrics) / top) * (H - PAD * 2)).toFixed(1)}`).join(" ");
    return `<polyline class="${className}" points="${points}"/>`;
  };
  const step = (W - PAD * 2) / Math.max(1, history.length - 1);
  const cycles = history
    .map((metrics, index) => (metrics.inCycles ? `<rect class="cycle" x="${(x(index) - step / 2).toFixed(1)}" y="0" width="${step.toFixed(1)}" height="${H}"/>` : ""))
    .join("");
  const now = x(at).toFixed(1);
  return (
    `<svg class="sparks" viewBox="0 0 ${W} ${H}" role="img" aria-label="Files and arrows between boxes, commit by commit">${cycles}` +
    `${line((metrics) => metrics.files, "files")}${line((metrics) => metrics.crossing, "crossing")}` +
    `<line class="now" x1="${now}" x2="${now}" y1="0" y2="${H}"/>` +
    `<text x="${PAD}" y="11" class="files">files</text><text x="${PAD + 34}" y="11" class="crossing">arrows between boxes</text></svg>`
  );
}
