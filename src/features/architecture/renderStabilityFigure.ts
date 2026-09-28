import { fixed } from "../../platform/charts/fixed";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { AgainstStability } from "./againstStabilityOf";
import { breakablePath } from "./breakablePath";
import { plural } from "./plural";
import type { BoxStability } from "./stabilityOf";

const W = 560;
const H = 420;
const PLOT = { left: 46, right: 14, top: 14, bottom: 44 };
/** Changes a file at which a box is as warm as the scale goes: few boxes go further, and those only by being one file changed with every feature. */
const WARMEST = 2.5;

const perFile = (box: BoxStability) => box.changes / Math.max(1, box.files);
const tenth = (value: number) => `${Math.round(value * 10) / 10}`;
/** How far a box stands from the line where abstractness and instability balance: 0 on it, 1 in a corner. */
const distanceOf = (box: BoxStability) => Math.abs(box.abstractness + (box.instability ?? 0) - 1);
const inPain = (box: BoxStability) => box.instability !== null && box.abstractness + box.instability < 0.5;
/** The boxes in the zone of pain that have changed, the most changed first: where the two kinds of unstable disagree. */
const painfulOf = (boxes: readonly BoxStability[]) => boxes.filter((box) => inPain(box) && box.changes > 0).sort((a, b) => perFile(b) - perFile(a) || b.changes - a.changes);

/** The picture: the two zones, the main sequence between them, and a dot for every box that needs or is needed, as warm as it changed. */
function plotOf(boxes: readonly BoxStability[]): string {
  const [innerW, innerH] = [W - PLOT.left - PLOT.right, H - PLOT.top - PLOT.bottom];
  const x = (instability: number) => PLOT.left + instability * innerW;
  const y = (abstractness: number) => PLOT.top + (1 - abstractness) * innerH;
  const zone = (className: string, corners: readonly (readonly [number, number])[]) => `<polygon class="zone ${className}" points="${corners.map(([i, a]) => `${fixed(x(i))},${fixed(y(a))}`).join(" ")}"/>`;
  // The coldest first and the warmest on top: where boxes lie on each other, the one that changed is the one seen.
  const placed = boxes.filter((box) => box.instability !== null).sort((a, b) => perFile(a) - perFile(b) || b.files - a.files);
  const dots = placed
    .map((box) => {
      const said = `${box.box}: needed by ${plural(box.neededBy, "file")} elsewhere, needs ${box.needs}; ${plural(box.changes, "change")} to its ${plural(box.files, "file")}`;
      return `<circle class="box" data-box="${escapeHtml(box.box)}" cx="${fixed(x(box.instability ?? 0))}" cy="${fixed(y(box.abstractness))}" r="${fixed(2.5 + Math.sqrt(box.files) * 0.9)}" style="--v:${Math.min(1, perFile(box) / WARMEST).toFixed(2)}"><title>${escapeHtml(said)}</title></circle>`;
    })
    .join("");
  // The corner is too crowded to write in: the boxes that hurt most are named in a column beside it, each with a line to its dot,
  // in the order they stand, top to bottom, so that the lines do not cross.
  const column = painfulOf(boxes)
    .slice(0, 4)
    .sort((a, b) => b.abstractness - a.abstractness || (a.instability ?? 0) - (b.instability ?? 0))
    .map((box, at) => ({ box, x: x(0.17), y: y(0.44) + at * 14 }));
  const leaders = column.map(({ box, x: lx, y: ly }) => `<line class="leader" x1="${fixed(lx - 3)}" y1="${fixed(ly - 3)}" x2="${fixed(x(box.instability ?? 0))}" y2="${fixed(y(box.abstractness))}"/>`).join("");
  const labels = column.map(({ box, x: lx, y: ly }) => `<text class="name" x="${fixed(lx)}" y="${fixed(ly)}">${escapeHtml(box.box)}</text>`).join("");
  // One 0 at the corner does for both scales.
  const ticks = [0, 0.5, 1].map((value) => `<text x="${fixed(x(value))}" y="${fixed(H - PLOT.bottom + 14)}" text-anchor="middle">${value}</text>${value === 0 ? "" : `<text x="${fixed(PLOT.left - 6)}" y="${fixed(y(value) + 3)}" text-anchor="end">${value}</text>`}`).join("");
  return (
    `<svg class="stability" viewBox="0 0 ${W} ${H}" role="img" aria-label="Every box by how unstable and how abstract it is, and how often it changed">` +
    zone("pain", [[0, 0], [0.5, 0], [0, 0.5]]) +
    zone("useless", [[1, 1], [0.5, 1], [1, 0.5]]) +
    `<rect class="frame" x="${PLOT.left}" y="${PLOT.top}" width="${innerW}" height="${innerH}"/>` +
    `<line class="sequence" x1="${fixed(x(0))}" y1="${fixed(y(1))}" x2="${fixed(x(1))}" y2="${fixed(y(0))}"/>` +
    `<text class="zone-name" x="${fixed(x(0.01))}" y="${fixed(y(0.5) - 5)}">zone of pain</text>` +
    `<text class="zone-name" x="${fixed(x(0.99))}" y="${fixed(y(0.5) + 13)}" text-anchor="end">zone of uselessness</text>` +
    `<text class="zone-name" transform="translate(${fixed(x(0.62))} ${fixed(y(0.38) - 6)}) rotate(${fixed((Math.atan2(innerH, innerW) * 180) / Math.PI)})" text-anchor="middle">the main sequence</text>` +
    `${leaders}${dots}${labels}${ticks}` +
    `<text class="axis" x="${fixed(x(0.5))}" y="${H - 8}" text-anchor="middle">instability: how little needs it, so how free it is to change</text>` +
    `<text class="axis" transform="translate(12 ${fixed(y(0.5))}) rotate(-90)" text-anchor="middle">abstractness: its files of nothing but types</text></svg>`
  );
}

/** The arrows against the rule of stable dependencies, counted, and the steepest named. */
function againstOf(against: readonly AgainstStability[]): string {
  const [steepest] = against;
  if (!steepest) return " No arrow between boxes goes against his rule of stable dependencies.";
  // When most of them leave one box, that box is the story, and it is named.
  const leaving = new Map<string, number>();
  for (const { from } of against) leaving.set(from, (leaving.get(from) ?? 0) + 1);
  const [box, count = 0] = [...leaving].sort((a, b) => b[1] - a[1])[0] ?? [];
  const most = box && count * 2 > against.length ? ` ${count} of them leave ${box}.` : "";
  return ` ${plural(against.length, "arrow")} between boxes ${against.length === 1 ? "goes" : "go"} from a box to a less stable one, against his rule of stable dependencies; the steepest, from ${steepest.from} to ${steepest.to}.${most}`;
}

/** How many boxes stand in the zone of pain, and, by name, the ones there that changed. */
function captionOf(boxes: readonly BoxStability[]): string {
  const count = boxes.filter(inPain).length;
  // The first says what the number is; after it, the number alone.
  const named = painfulOf(boxes).map((box, at) => `${box.box} (${tenth(perFile(box))}${at === 0 ? ` ${perFile(box) === 1 ? "change" : "changes"} a file` : ""})`);
  const list = named.length > 1 ? `${named.slice(0, -1).join(", ")} and ${named.at(-1)}` : (named[0] ?? "none of them");
  return `${plural(count, "box", "boxes")} ${count === 1 ? "stands" : "stand"} in the zone of pain. The ones there that have changed, the most first: ${list}.`;
}

/** Every box's figures, for whoever wants the numbers the picture is drawn from. */
function tableOf(boxes: readonly BoxStability[]): string {
  const rows = [...boxes]
    .sort((a, b) => a.box.localeCompare(b.box))
    .map(
      (box) =>
        `<tr><td><code>${breakablePath(box.box)}</code></td><td>${box.files}</td><td>${box.neededBy}</td><td>${box.needs}</td>` +
        `<td>${box.instability === null ? "–" : box.instability.toFixed(2)}</td><td>${box.abstractness.toFixed(2)}</td><td>${box.instability === null ? "–" : distanceOf(box).toFixed(2)}</td><td>${tenth(perFile(box))}</td></tr>`,
    )
    .join("");
  return `<details class="numbers"><summary>every box's figures</summary><table><thead><tr><th>box</th><th>files</th><th>needed by</th><th>needs</th><th>I</th><th>A</th><th>D</th><th>changes a file</th></tr></thead><tbody>${rows}</tbody></table></details>`;
}

/**
 * Robert C. Martin's picture of components, with each box of the source on
 * it: across, how unstable its place is; up, how abstract it is. A box at the
 * bottom left is needed by much, needs little and is concrete — hard to
 * change, and nothing in it to change instead: his zone of pain. He says it
 * only hurts for what keeps changing, and that is the one thing his picture
 * cannot show, so each box is as warm as the history says its files changed.
 */
export function renderStabilityFigure(boxes: readonly BoxStability[], against: readonly AgainstStability[] = []): string {
  return `<figure class="changes-figure">${plotOf(boxes)}<figcaption>${captionOf(boxes)}${againstOf(against)}</figcaption>${tableOf(boxes)}</figure>`;
}
