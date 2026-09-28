import { fixed } from "../../platform/charts/fixed";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { Ground } from "./groundOf";
import type { Life } from "./Life";

const W = 560;
const H = 400;
const PLOT = { left: 44, right: 16, top: 12, bottom: 44 };
const TICKS = [0, 1, 2, 5, 10, 20, 50, 100];
const NAMED = 3;

const tenth = (value: number) => `${Math.round(value * 10) / 10}`;
const listOf = (items: readonly string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : (items[0] ?? ""));

interface Placed extends Ground {
  readonly path: string;
}

/**
 * What each file's ground predicted, beside what it did: across, the changes
 * the changes below it made likely — its exposure — and up, the changes it
 * had, both on the same square-root scale so that the many files with few
 * can be told apart, and the line where the two agree drawn through them.
 * A file far above the line changed for reasons of its own; one far below it
 * stood on moving ground and did not move. The furthest are named.
 */
export function renderGroundFigure(ground: ReadonlyMap<number, Ground>, lives: readonly Life[]): string {
  const standing = new Map(lives.filter((life) => !life.test && life.went === undefined).map((life) => [life.id, life.path]));
  const files: Placed[] = [...ground].flatMap(([id, counted]) => {
    const path = standing.get(id);
    return path === undefined ? [] : [{ path, ...counted }];
  });
  const most = Math.max(1, ...files.map(({ expected, actual }) => Math.max(expected, actual)));
  const [innerW, innerH] = [W - PLOT.left - PLOT.right, H - PLOT.top - PLOT.bottom];
  const x = (value: number) => PLOT.left + Math.sqrt(value / most) * innerW;
  const y = (value: number) => PLOT.top + innerH - Math.sqrt(value / most) * innerH;
  const above = files.filter(({ expected, actual }) => actual >= 2 * expected && actual - expected >= 2).sort((a, b) => b.actual - b.expected - (a.actual - a.expected));
  const below = files.filter(({ expected, actual }) => actual <= expected / 2 && expected - actual >= 1).sort((a, b) => b.expected - b.actual - (a.expected - a.actual));
  const exposed = [...files].sort((a, b) => b.expected - a.expected).slice(0, NAMED);

  const ticks = TICKS.filter((tick) => tick <= most)
    .map((tick) => `<text x="${fixed(x(tick))}" y="${fixed(H - PLOT.bottom + 14)}" text-anchor="middle">${tick}</text><text x="${fixed(PLOT.left - 6)}" y="${fixed(y(tick) + 3)}" text-anchor="end">${tick}</text>`)
    .join("");
  const dots = files
    .map((file) => {
      const kind = above.includes(file) ? " above" : below.includes(file) ? " below" : "";
      return `<circle class="file${kind}" cx="${fixed(x(file.expected))}" cy="${fixed(y(file.actual))}" r="3.2"><title>${escapeHtml(`${file.path}: ${file.actual} changes, ${tenth(file.expected)} from its ground`)}</title></circle>`;
    })
    .join("");
  // Beside its dot, and never under the plot: a file with no change at all sits on its floor, and is named above it.
  const name = (file: Placed, kind: "above" | "below", at: number) => {
    const wanted = y(file.actual) + (kind === "above" ? -4 : 12) + at * 11;
    const top = wanted > PLOT.top + innerH - 3 ? y(file.actual) - 6 - at * 11 : wanted;
    return `<text class="name ${kind}" x="${fixed(x(file.expected) + 6)}" y="${fixed(top)}">${escapeHtml(file.path.split("/").pop() ?? file.path)}</text>`;
  };
  const names = [...above.slice(0, 2).map((file, at) => name(file, "above", at)), ...below.slice(0, 2).map((file, at) => name(file, "below", at))].join("");
  const svg =
    `<svg class="ground" viewBox="0 0 ${W} ${H}" role="img" aria-label="Every file by the changes its ground made likely and the changes it had">` +
    `<rect class="frame" x="${PLOT.left}" y="${PLOT.top}" width="${innerW}" height="${innerH}"/>` +
    `<line class="even" x1="${fixed(x(0))}" y1="${fixed(y(0))}" x2="${fixed(x(most))}" y2="${fixed(y(most))}"/>` +
    `<text class="even-name" x="${fixed(x(most * 0.62))}" y="${fixed(y(most * 0.62) + 14)}">as its ground made likely</text>` +
    `${dots}${names}${ticks}` +
    `<text class="axis" x="${fixed(PLOT.left + innerW / 2)}" y="${H - 8}" text-anchor="middle">what its ground made likely, in changes</text>` +
    `<text class="axis" transform="translate(12 ${fixed(PLOT.top + innerH / 2)}) rotate(-90)" text-anchor="middle">the changes it had</text></svg>`;

  const said = [
    `The files that stand on the most that moved: ${listOf(exposed.map((file) => `${file.path} (${tenth(file.expected)})`))}.`,
    above.length > 0 ? `The ones that changed far more than their ground explains: ${listOf(above.slice(0, NAMED).map((file) => `${file.path} (${file.actual} against ${tenth(file.expected)})`))}.` : "",
    below.length > 0 ? `The ones that moved far less than theirs made likely: ${listOf(below.slice(0, NAMED).map((file) => `${file.path} (${file.actual} against ${tenth(file.expected)})`))}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const key = (kind: string, words: string) => `<span class="key dot ${kind}"></span>${words}`;
  const legend = `<p class="changes-legend">${key("above", "changed far more than its ground made likely")}${key("below", "far less")}${key("even", "about as its ground made likely")}</p>`;
  return `<figure class="changes-figure">${svg}${legend}<figcaption>${escapeHtml(said)}</figcaption></figure>`;
}
