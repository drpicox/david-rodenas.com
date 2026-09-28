import { changeMatrixOf } from "./changeMatrixOf";
import type { Commit } from "./History";
import { layoutArchitecture } from "./layoutArchitecture";
import { plural } from "./plural";
import type { HistoryRead } from "./readHistory";
import { renderChangeMatrix } from "./renderChangeMatrix";
import { SWEEP } from "./SWEEP";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** From one commit's day to another's, saying the month and the year once when they are the same. */
function spanOf(first: Commit, last: Commit): string {
  const [y1, m1 = 1, d1] = first.date.slice(0, 10).split("-").map(Number);
  const [y2, m2 = 1, d2] = last.date.slice(0, 10).split("-").map(Number);
  const [month1, month2] = [MONTHS[m1 - 1], MONTHS[m2 - 1]];
  if (y1 !== y2) return `from ${d1} ${month1} ${y1} to ${d2} ${month2} ${y2}`;
  if (m1 !== m2) return `from ${d1} ${month1} to ${d2} ${month2} ${y2}`;
  return d1 === d2 ? `on ${d1} ${month1} ${y1}` : `from ${d1} to ${d2} ${month2} ${y2}`;
}

/**
 * Where the changes went, as a figure: the picture of every box at every
 * commit, a key to its marks, and what it counts. The boxes are grouped as
 * the picture of the architecture stands them, what needs above what is needed.
 */
export function renderChangeMatrixFigure({ history, snapshots, lives }: HistoryRead): string {
  const last = snapshots.at(-1) ?? { modules: [], dependencies: [] };
  const bands = layoutArchitecture(last).bands.map((band) => band.name);
  const sweeps = new Set(history.changes.flatMap((change, at) => (change.changed.length > SWEEP ? [at] : [])));
  const shipped = lives.filter((life) => !life.test);
  const changes = shipped.reduce((sum, life) => sum + life.changed.length, 0);
  const [first, final] = [history.commits[0], history.commits.at(-1)];
  const span = first && final ? `${plural(history.commits.length, "commit")}, ${spanOf(first, final)}` : "no commits";
  const key = (className: string, words: string) => `<span class="key ${className}"></span>${words}`;
  // The keys are shaded by the same rule as the cells, at the shade one, two, four and eight files get.
  const shade = (v: number, words: string) => `<span class="key shade" style="--v:${v}"></span>${words}`;
  return (
    `<figure class="changes-figure">${renderChangeMatrix(changeMatrixOf(lives, bands), history.commits, sweeps)}` +
    `<p class="changes-legend">${shade(0.25, "one file changed")}${shade(0.5, "two")}${shade(0.75, "four")}${shade(1, "eight or more")}${key("written", "a file written")}${key("sweep", `a sweep, over ${SWEEP} files at once`)}</p>` +
    `<figcaption>${span}: ${plural(changes, "change")} to files that ship, and ${plural(shipped.length, "file")} written.</figcaption></figure>`
  );
}
