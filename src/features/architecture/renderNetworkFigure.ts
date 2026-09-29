import { fixed } from "../../platform/charts/fixed";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { type Network, networkOf } from "./networkOf";
import { percent } from "./percent";
import { plural } from "./plural";
import type { Snapshot } from "./Snapshot";

/** The tails, a drawing of their own. */
const TAILS = { width: 440, height: 290 };
const PLOT = { left: 52, right: 428, top: 14, bottom: 238 };
/** The network against chance, another, which stands under the tails where the screen is narrow. */
const CHANCE = { width: 250, height: 214, bar: 130 };
const DEGREES = [1, 2, 5, 10, 20, 50, 100, 200, 500];
const SHARES = [1, 0.1, 0.01, 0.001];

const times = (value: number) => (value >= 10 ? `${Math.round(value)}` : value.toFixed(1));
const nameOf = (path: string) => path.split("/").pop() ?? path;

/** For each degree the files have, how many have that many or more: the tail, where a few files are needed by many, is what a log scale can show. */
function tailOf(degrees: readonly number[]): { degree: number; files: number }[] {
  const counted = new Map<number, number>();
  for (const degree of degrees) if (degree > 0) counted.set(degree, (counted.get(degree) ?? 0) + 1);
  let left = [...counted.values()].reduce((sum, count) => sum + count, 0);
  return [...counted]
    .sort((a, b) => a[0] - b[0])
    .map(([degree, count]) => {
      const point = { degree, files: left };
      left -= count;
      return point;
    });
}

/** The file at the end of a tail: the one with the most. */
function endOf(degrees: readonly number[], shipped: readonly { path: string }[]): { degree: number; path: string } {
  const highest = Math.max(0, ...degrees);
  return { degree: highest, path: shipped[degrees.indexOf(highest)]?.path ?? "" };
}

/** Two bars, the network's and a random one's, on a scale of their own: two measures are never read off one axis. */
function pairOf(top: number, title: string, mine: number, chance: number, said: (value: number) => string): string {
  const most = Math.max(mine, chance) || 1;
  const bar = (value: number, kind: string, y: number, words: string) => {
    const width = Math.max(1.5, (value / most) * CHANCE.bar);
    return `<rect class="bar ${kind}" x="4" y="${y}" width="${fixed(width)}" height="11" rx="2"/><text class="value" x="${fixed(4 + width + 6)}" y="${y + 9}">${said(value)} ${words}</text>`;
  };
  return `<text class="pair" x="4" y="${top}">${title}</text>${bar(mine, "mine", top + 7, "here")}${bar(chance, "chance", top + 22, "at random")}`;
}

/** The share of files needed by so many or more, and needing so many or more, on log scales both. */
function tailsOf(network: Network, shipped: readonly { path: string }[]): string {
  const most = Math.max(2, ...network.neededBy, ...network.needs);
  const files = Math.max(2, network.files);
  const x = (degree: number) => PLOT.left + (Math.log(degree) / Math.log(most)) * (PLOT.right - PLOT.left);
  const y = (share: number) => PLOT.top + (-Math.log(share) / Math.log(files)) * (PLOT.bottom - PLOT.top);
  const series = (tail: readonly { degree: number; files: number }[], kind: string, words: string) => {
    const points = tail.map(({ degree, files: count }) => `${fixed(x(degree))},${fixed(y(count / network.files))}`);
    const line = points.length > 1 ? `<polyline class="tail ${kind}" points="${points.join(" ")}"/>` : "";
    const dots = tail
      .map(({ degree, files: count }) => `<circle class="dot ${kind}" cx="${fixed(x(degree))}" cy="${fixed(y(count / network.files))}" r="3"><title>${words} ${degree} or more: ${plural(count, "file")}, ${percent(count, network.files)}</title></circle>`)
      .join("");
    return line + dots;
  };
  const [needed, needing] = [endOf(network.neededBy, shipped), endOf(network.needs, shipped)];
  // Named in the corner the tails never reach, each by the mark of its tail: beside the ends themselves, a name would lie across the lines.
  const ends = [
    { end: needed, kind: "in", words: `${nameOf(needed.path)}, needed by ${needed.degree}` },
    { end: needing, kind: "out", words: `${nameOf(needing.path)}, needing ${needing.degree}` },
  ]
    .filter(({ end }) => end.degree > 0)
    .map(({ kind, words }, at) => `<circle class="dot ${kind}" cx="${PLOT.right - 9}" cy="${PLOT.top + 13 + at * 15}" r="3"/><text class="end" x="${PLOT.right - 17}" y="${PLOT.top + 16.5 + at * 15}" text-anchor="end">${escapeHtml(words)}</text>`)
    .join("");
  const ticks =
    DEGREES.filter((degree) => degree <= most).map((degree) => `<text class="tick" x="${fixed(x(degree))}" y="${PLOT.bottom + 14}" text-anchor="middle">${degree}</text>`).join("") +
    SHARES.filter((share) => share >= 1 / files).map((share) => `<text class="tick" x="${PLOT.left - 6}" y="${fixed(y(share) + 3)}" text-anchor="end">${share * 100}%</text>`).join("");
  return (
    `<svg class="network tails" viewBox="0 0 ${TAILS.width} ${TAILS.height}" role="img" aria-label="The share of files needed by so many others or more, and the share needing so many or more, on log scales">` +
    `<rect class="frame" x="${PLOT.left}" y="${PLOT.top}" width="${PLOT.right - PLOT.left}" height="${PLOT.bottom - PLOT.top}"/>` +
    `${ticks}${series(tailOf(network.needs), "out", "needing")}${series(tailOf(network.neededBy), "in", "needed by")}${ends}` +
    `<text class="axis" x="${(PLOT.left + PLOT.right) / 2}" y="${TAILS.height - 22}" text-anchor="middle">how many others: needed by, or needing (a log scale)</text>` +
    `<text class="axis" transform="translate(12 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)" text-anchor="middle">the share of files (a log scale)</text></svg>`
  );
}

/** Its clustering and the length of the ways between its files, beside a random network's, and the two made one number. */
function chanceOf(network: Network): string {
  return (
    `<svg class="network chance" viewBox="0 0 ${CHANCE.width} ${CHANCE.height}" role="img" aria-label="The network's clustering and paths against a random network as big">` +
    `<text class="side-title" x="4" y="22">against a random network as big</text>` +
    pairOf(52, "clustering", network.clustering, network.randomClustering, (value) => value.toPrecision(2)) +
    pairOf(112, "mean way between two files, in arrows", network.meanPath, network.randomPath, (value) => value.toFixed(2)) +
    `<text class="pair" x="4" y="176">small-world-ness</text><text class="hero" x="4" y="206">${network.smallWorld.toFixed(1)}</text></svg>`
  );
}

/**
 * The source as a network: how its files' degrees are spread, and how it
 * stands against a random network as big. First, on log scales both, the
 * share of the files needed by so many others or more, and the share that
 * need so many or more — the way the tails of a network's degrees are read,
 * since a few files needed by very many are lost on a straight scale. Then its
 * clustering and the length of the ways between its files beside a random
 * network's of as many files and links (Watts and Strogatz, 1998), and the two
 * made one number, its small-world-ness (Humphries and Gurney, 2008).
 */
export function renderNetworkFigure(snapshot: Snapshot): string {
  const network = networkOf(snapshot);
  const shipped = snapshot.modules.filter((module) => !module.test);
  // A random network to set it against needs links enough to have ways through it: more than one a file.
  const chance = network.randomPath > 0 && network.meanPath > 0;
  const [needed, needing] = [endOf(network.neededBy, shipped), endOf(network.needs, shipped)];
  const few = network.neededBy.filter((degree) => degree <= 2).length;
  const said =
    network.arrows === 0
      ? `The ${plural(network.files, "file")} that ship need nothing of each other yet.`
      : `Of the ${plural(network.files, "file")} that ship, ${percent(few, network.files)} are needed by two others or fewer, and ${nameOf(needed.path)} is needed by ${needed.degree}, the most; ${nameOf(needing.path)} needs ${needing.degree}, the most. ` +
        (chance
          ? `The network is ${times(network.clustering / network.randomClustering)} times as clustered as a random network of as many files and links, and the ways between its files are ${times(network.meanPath / network.randomPath)} times as long: a small-world-ness of ${network.smallWorld.toFixed(1)}.`
          : "It has too few links yet to set against a random network.");
  const key = (kind: string, words: string) => `<span class="key ${kind}"></span>${words}`;
  return (
    `<figure class="changes-figure"><div class="network-drawings">${tailsOf(network, shipped)}${chance ? chanceOf(network) : ""}</div>` +
    `<p class="changes-legend">${key("needed-by", "needed by so many or more")}${key("needing", "needing so many or more")}</p><figcaption>${escapeHtml(said)}</figcaption></figure>`
  );
}
