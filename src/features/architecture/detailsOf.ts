import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { bandOf } from "./bandOf";
import { boxOf } from "./boxOf";
import type { Coverage } from "./Coverage";
import { type Coupled, couplingOf } from "./couplingOf";
import { dayOf } from "./dayOf";
import { fileHistoryOf } from "./fileHistoryOf";
import { historyUpTo } from "./historyUpTo";
import { measuresOf } from "./measuresOf";
import { networkOf } from "./networkOf";
import { percent } from "./percent";
import { plural } from "./plural";
import { positionOf } from "./positionOf";
import type { HistoryRead } from "./readHistory";
import { renderLifeStrip } from "./renderLifeStrip";
import type { Snapshot } from "./Snapshot";
import { sourceUrlOf } from "./sourceUrlOf";
import { stabilityOf } from "./stabilityOf";
import { sweepsOf } from "./sweepsOf";

/** What is chosen on the picture: a file, by its path; a box, by its name; or nothing, and then it is the network as a whole. */
export type Chosen = { readonly file: string } | { readonly box: string } | null;

const NOTHING: Snapshot = { modules: [], dependencies: [] };
/** Names a row gives before it counts the rest. */
const NAMED = 3;

const two = (value: number) => value.toFixed(2).replace("-", "−");
const nameOf = (path: string) => path.split("/").pop() ?? path;
const ordinal = (place: number) => `${place}${place % 100 >= 11 && place % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][place % 10] ?? "th")}`;
const row = (term: string, said: string) => `<dt>${term}</dt><dd>${said}</dd>`;
const muted = (words: string) => `<span class="details-by">${words}</span>`;
const listOf = (named: readonly string[], rest: number, one: string, many = `${one}s`) => `${named.join(", ")}${rest > 0 ? ` and ${rest} more ${rest === 1 ? one : many}` : ""}`;
// A link that leaves the site is marked so by the stylesheet, as every such link is.
const link = (url: string, words: string) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${words}</a>`;
// Every name in the panel is a way to its own details: the picture's click, from inside the words.
const fileButton = (path: string) => `<button type="button" data-file="${escapeHtml(path)}">${escapeHtml(nameOf(path))}</button>`;
const boxButton = (box: string, words = box) => `<button type="button" data-box="${escapeHtml(box)}">${escapeHtml(words)}</button>`;
const BACK = `<button type="button" class="details-back" data-back>← the whole network</button>`;
const boxesOf = (coupled: readonly Coupled[]) => listOf(coupled.slice(0, NAMED).map(({ box, files }) => `${boxButton(box)} ${files}`), coupled.length - NAMED, "box", "boxes");

/** The network as a whole, and the files it hinges on, for when nothing is chosen. */
function networkSaid(snapshot: Snapshot): string {
  const network = networkOf(snapshot);
  const shipped = new Map(snapshot.modules.filter((module) => !module.test).map((module) => [module.id, module.path]));
  const first = (measure: ReadonlyMap<number, number>) =>
    [...measure]
      .filter(([id, value]) => shipped.has(id) && value > 0)
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, NAMED)
      .map(([id]) => fileButton(shipped.get(id) ?? ""))
      .join(", ") || "none";
  const leaning = Math.abs(network.assortativity);
  const lean = leaning < 0.05 ? "files with many links lean neither way" : `files with many links lean to files with ${network.assortativity < 0 ? "few" : "many"}${leaning < 0.2 ? ", a little" : ""}`;
  const cored = [...measuresOf.cores(snapshot).values()].filter((core) => core === network.deepestCore).length;
  // A random network to set it against needs links enough to have ways through it: more than one a file.
  const chance = network.randomPath > 0 && network.meanPath > 0;
  const [clustered, longer] = [network.clustering / (network.randomClustering || 1), network.meanPath / (network.randomPath || 1)];
  return (
    `<h3>The network</h3>` +
    `<p class="details-hint">Click a file or a box for its details, and a way to its code.</p><dl>` +
    row("files", `${network.files}, joined by ${plural(network.arrows, "arrow")}: ${percent(network.density, 1)} of those there could be`) +
    row("links", `${two(network.meanDegree)} a file, on average, the arrows read either way`) +
    row("parts", network.parts === 1 ? "one: every file is joined to every other, some way" : `${network.parts}; the largest holds ${plural(network.largestPart, "file")}`) +
    row("circles", network.circles === 0 ? "none: no files need each other round in a circle" : `${network.circles}, holding ${plural(network.inCircles, "file")}`) +
    row("apart", network.meanPath > 0 ? `${two(network.meanPath)} arrows between two files${network.parts > 1 ? " of the largest part" : ""}, on average, and ${network.diameter} at most${chance ? `; ${two(network.randomPath)} in a random network as big` : ""}` : "no two files joined yet") +
    row("clustering", `${two(network.clustering)}: of the pairs of files joined to a file, the share joined to each other too, on average over the files${chance ? `; ${network.randomClustering.toPrecision(2)} in a random network as big` : ""}`) +
    row("small-world-ness", chance ? `${network.smallWorld.toFixed(1)}: ${Math.round(clustered)} times as clustered as chance, with ways ${longer.toFixed(1)} times as long${network.smallWorld > 1 ? ": a small world" : ""}` : "none yet: too few links to set against chance") +
    row("assortativity", `${two(network.assortativity)}: ${lean}`) +
    row("deepest core", `${network.deepestCore}, ${plural(cored, "file")}: what is left when every file with fewer links than that is taken away, again and again`) +
    row("tallest stack", `${plural(network.tallest, "arrow")}: the longest chain of what needs what`) +
    row("needed by none", plural(network.sources, "file")) +
    row("needing none", plural(network.sinks, "file")) +
    `</dl><h4>The files it hinges on</h4><dl>` +
    row("most needed", `${first(measuresOf.pageRank(snapshot))} ${muted("by PageRank")}`) +
    row("most between", first(measuresOf.bridges(snapshot))) +
    row("reaching furthest", first(measuresOf.reach(snapshot))) +
    `</dl>`
  );
}

/** Where a file that ships stands in the network, in every measure the picture and the page read it by. */
function positionSaid(snapshot: Snapshot, id: number, path: string): string {
  const position = positionOf(snapshot, id);
  const box = couplingOf(snapshot, boxOf(path));
  const deepest = Math.max(0, ...measuresOf.cores(snapshot).values());
  const { boxes, files } = position.group;
  return (
    `<h4>In the network</h4><dl>` +
    row("needs", `${position.needs} directly, ${position.dependsOn} near or far`) +
    row("needed by", `${position.neededBy} directly; a change to it could reach ${plural(position.reaches, "file")}`) +
    // A share too small to show as a percentage is not none.
    row("between", position.bridge === 0 ? "on none of the shortest ways between two others" : `on ${position.bridge < 0.001 ? "under 0.1%" : percent(position.bridge, 1)} of the shortest ways between two others`) +
    row("PageRank", `${position.rank.tied > 0 ? "joint " : ""}${ordinal(position.rank.place)} of ${position.rank.of}${position.rank.tied > 0 ? `, with ${plural(position.rank.tied, "other")}` : ""}`) +
    row("apart", position.closeness > 0 ? `${two(1 / position.closeness)} arrows from the rest of its part, on average` : "joined to nothing") +
    row("core", position.core === deepest ? `${position.core}, the deepest there is` : `${position.core}; the deepest is ${deepest}`) +
    row("stack under it", plural(position.height, "arrow")) +
    row("clustering", position.links < 2 ? "none: fewer than two files joined to it" : `${two(position.clustering)}: of the pairs of files joined to it, the share joined to each other too`) +
    row("its group", `${plural(files, "file")}: ${listOf(boxes.slice(0, NAMED).map(([name, count]) => `${boxButton(name, nameOf(name))} ${count}`), boxes.length - NAMED, "box", "boxes")}`) +
    row("its box", `${boxButton(box.box)}: Ca ${box.ca}, Ce ${box.ce}, I ${box.instability === null ? "none" : two(box.instability)}`) +
    row("tests", position.tests === 0 ? "no test imports it" : `${plural(position.tests, "test")} ${position.tests === 1 ? "imports" : "import"} it`) +
    `</dl>`
  );
}

/** A file: where it stands in the network, its history, and a way to its code as it stood at the commit shown. */
function fileSaid(read: HistoryRead, at: number, path: string, coverage: Coverage | null): string {
  const snapshot = read.snapshots[at] ?? NOTHING;
  const module = snapshot.modules.find((one) => one.path === path);
  const commit = read.history.commits[at];
  if (!module || !commit) return `${BACK}<p class="details-hint"><code>${escapeHtml(path)}</code> is not there at this commit.</p>`;
  const history = fileHistoryOf(read, at, module.id);
  const then = historyUpTo(read, at);
  const life = then.lives.find((one) => one.id === module.id);
  const share = coverage?.sha === commit.sha ? coverage.lines[path] : undefined;
  const sweeps = history.changes.filter((change) => change.sweep).length;
  const latest = history.changes.at(-1);
  const partners = history.partners.map(({ path: other, together, joined }) => `${fileButton(other)} ${together}×${joined === "none" ? ` ${muted("no arrow")}` : ""}`);
  const commits = [...history.changes]
    .reverse()
    .map(({ commit: changed, sweep }) => `<li>${dayOf(changed)} · ${escapeHtml(changed.subject)}${sweep ? ` ${muted("a sweep")}` : ""}</li>`)
    .join("");
  const imports = snapshot.dependencies.filter(({ from }) => from === module.id).length;
  return (
    `${BACK}<h3 class="details-name"><code>${escapeHtml(path)}</code></h3>` +
    `<p class="details-where">${module.test ? "a test" : boxButton(boxOf(path))} · ${plural(module.lines, "line")}${share === undefined ? "" : ` · tests run ${Math.round(share)}% of it`} · ${link(sourceUrlOf(commit.sha, path), "its code")}</p>` +
    (module.test ? `<p class="details-hint">A test, which imports ${plural(imports, "file")}: the network is what ships, and a test stands outside it.</p>` : positionSaid(snapshot, module.id, path)) +
    `<h4>In the history</h4><dl>` +
    row("written", `${dayOf(history.born.commit)}, commit ${history.born.at + 1}: ${escapeHtml(history.born.commit.subject)}`) +
    row("changed", `${history.changes.length === 0 ? "not since" : plural(history.changes.length, "time")}${sweeps > 0 ? `, ${sweeps} of them in a sweep` : ""}${life ? renderLifeStrip(life, then.history.commits.length, read.history.commits.length) : ""}`) +
    (latest ? row("last changed", `${dayOf(latest.commit)}, ${latest.at === at ? "at the commit shown" : `${plural(at - latest.at, "commit")} back`}`) : "") +
    (history.ground ? row("its ground", `would lead one to expect ${history.ground.expected.toFixed(1)} changes; it had ${history.ground.actual}${sweeps > 0 ? ", the sweeps left out" : ""}`) : "") +
    // What changed with what is counted between the files that ship, as the threads on the picture are.
    (module.test ? "" : row("changed with", partners.length > 0 ? partners.join(", ") : "no file twice")) +
    `</dl>` +
    (commits ? `<details class="details-commits"><summary>the ${plural(history.changes.length, "commit")} that changed it</summary><ol reversed>${commits}</ol></details>` : "")
  );
}

/** A box: Robert C. Martin's measures, worked out; its history; its files; and a way to its folder. */
function boxSaid(read: HistoryRead, at: number, name: string): string {
  const snapshot = read.snapshots[at] ?? NOTHING;
  const commit = read.history.commits[at];
  const coupling = couplingOf(snapshot, name);
  if (!commit || coupling.files.length === 0) return `${BACK}<p class="details-hint"><code>${escapeHtml(name)}</code> is not there at this commit.</p>`;
  const then = historyUpTo(read, at);
  const sweeps = sweepsOf(then.history);
  const box = stabilityOf(snapshot, then.lives, sweeps).find((one) => one.box === name);
  const { ca, ce, instability } = coupling;
  const abstractness = box?.abstractness ?? 0;
  const pathOf = new Map(snapshot.modules.map((module) => [module.id, module.path]));
  const changes = new Map(then.lives.map((life) => [life.id, life.changed.filter((when) => !sweeps.has(when)).length]));
  const files = [...coupling.files].sort((a, b) => (changes.get(b) ?? 0) - (changes.get(a) ?? 0) || (pathOf.get(a) ?? "").localeCompare(pathOf.get(b) ?? ""));
  const kind = bandOf(name) === "platform" ? "a box of the frame" : bandOf(name) === "features" ? "a feature" : "the top of the source";
  // A box can be one file, as the top of the source is: its link is to the file.
  const alone = /\.[a-z]+$/.test(name);
  const distance = instability === null ? null : Math.abs(abstractness + instability - 1);
  return (
    `${BACK}<h3 class="details-name"><code>${escapeHtml(name)}</code></h3>` +
    `<p class="details-where">${kind} · ${plural(coupling.files.length, "file")} · ${link(sourceUrlOf(commit.sha, name, "box"), alone ? "its code" : "its folder")}</p>` +
    `<h4>As Robert C. Martin measures it</h4><dl>` +
    row("Ca", `${ca}: files elsewhere that need it${coupling.neededBy.length > 0 ? `, in ${boxesOf(coupling.neededBy)}` : ""}`) +
    row("Ce", `${ce}: its files that need elsewhere${coupling.needs.length > 0 ? `, needing ${boxesOf(coupling.needs)}` : ""}`) +
    row("instability", instability === null ? "none: it neither needs nor is needed" : `I = Ce / (Ca + Ce) = ${ce} / (${ca} + ${ce}) = ${Math.round(instability * 100) / 100}`) +
    row("abstractness", `A = ${two(abstractness)}, the share of its files of nothing but types`) +
    (distance === null ? "" : row("distance", `D = |A + I − 1| = ${two(distance)}${abstractness + (instability ?? 0) < 0.5 ? ": in the zone of pain" : ""}`)) +
    `</dl><h4>In the history</h4><dl>` +
    row("changes", `${box?.changes ?? 0} to its files, ${((box?.changes ?? 0) / coupling.files.length).toFixed(1)} a file, the sweeps left out`) +
    `</dl><h4>Its files, the most changed first</h4><ol class="details-files">` +
    files.map((id) => `<li>${fileButton(pathOf.get(id) ?? "")} ${muted(plural(changes.get(id) ?? 0, "change"))}</li>`).join("") +
    `</ol>`
  );
}

/**
 * What the panel beside the picture says of what is chosen on it, at the
 * commit shown: of a file, where it stands in the network, its history, and a
 * way to its code as it stood then; of a box, Robert C. Martin's measures
 * worked out, its history and its files, and a way to its folder; and with
 * nothing chosen, the network as a whole, read the way network science reads
 * any network, and the files it hinges on. Every name in it is a way to its
 * own details.
 */
export function detailsOf(read: HistoryRead, at: number, chosen: Chosen, coverage: Coverage | null): string {
  if (chosen && "file" in chosen) return fileSaid(read, at, chosen.file, coverage);
  if (chosen && "box" in chosen) return boxSaid(read, at, chosen.box);
  return networkSaid(read.snapshots[at] ?? NOTHING);
}
