import { fixed } from "../../platform/charts/fixed";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { MatrixRow } from "./changeMatrixOf";
import { dayOf } from "./dayOf";
import type { Commit } from "./History";
import { plural } from "./plural";

const W = 1100;
/** Room on the left for the names of the boxes. */
const LABEL = 150;
const RIGHT = 6;
const ROW = 11;
const BAND = 16;
const GAP = 8;
const AXIS = 20;
/** One file is already a mark; each doubling darker, and eight or more as dark as it goes. */
const shade = (changed: number) => Math.min(1, 0.25 + 0.25 * Math.log2(changed));
/** The box's name without its band, which the rows are grouped under already. */
const labelOf = (row: MatrixRow) => (row.box === null ? "gone" : row.box.slice(row.box.indexOf("/") + 1));

/** The rows, band by band under their names, each a box's cells: returns the markup and where the rows end. */
function rowsOf(rows: readonly MatrixRow[], x: (at: number) => number, width: number): { markup: string; bottom: number } {
  const drawn: string[] = [];
  let y = 0;
  let band: string | null | undefined;
  for (const row of rows) {
    if (row.band !== band) {
      y += band === undefined ? 0 : GAP;
      if (row.band !== null) {
        drawn.push(`<text class="band" x="0" y="${fixed(y + 11)}">${escapeHtml(row.band)}</text>`);
        y += BAND;
      }
      band = row.band;
    }
    const changes = row.cells.reduce((sum, [, changed]) => sum + changed, 0);
    const written = row.cells.reduce((sum, [, , files]) => sum + files, 0);
    const said = `${row.box ?? "the files that are gone"}: ${plural(changes, "change")}, ${plural(written, "file")} written`;
    drawn.push(`<text class="row" data-box="${escapeHtml(row.box ?? "")}" data-top="${fixed(y)}" x="${LABEL - 6}" y="${fixed(y + ROW - 2.5)}" text-anchor="end">${escapeHtml(labelOf(row))}<title>${escapeHtml(said)}</title></text>`);
    for (const [at, changed, files] of row.cells) {
      if (changed > 0) drawn.push(`<rect class="changed" x="${fixed(x(at) + 0.5)}" y="${fixed(y + 0.5)}" width="${fixed(Math.max(1, width - 1))}" height="${ROW - 2}" rx="1" style="--v:${shade(changed).toFixed(2)}"/>`);
      if (files > 0) drawn.push(`<circle class="written" cx="${fixed(x(at) + width / 2)}" cy="${fixed(y + ROW / 2 - 0.5)}" r="1.7"/>`);
    }
    y += ROW;
  }
  return { markup: drawn.join(""), bottom: y };
}

/** Under the rows, the day of the first commit of each day, as many as fit. */
function daysOf(commits: readonly Commit[], x: (at: number) => number, bottom: number): string {
  const days: string[] = [];
  let lastAt = -Infinity;
  commits.forEach((commit, at) => {
    const day = dayOf(commit);
    if ((at > 0 && dayOf(commits[at - 1] ?? commit) === day) || x(at) - lastAt < 36) return;
    lastAt = x(at);
    days.push(`<line class="day" x1="${fixed(x(at))}" x2="${fixed(x(at))}" y1="${fixed(bottom + 2)}" y2="${fixed(bottom + 6)}"/><text class="day" x="${fixed(x(at))}" y="${fixed(bottom + 16)}">${day}</text>`);
  });
  return days.join("");
}

/**
 * Every commit, every box: a row for each box there is now and a column for
 * each commit, a cell darker the more of the box's files the commit changed,
 * and a dot where it wrote new ones. Read across, a row is a box's life — a
 * feature is written in a burst and goes quiet, the frame keeps being
 * touched; read down, a column is one commit, and the shaded ones are sweeps.
 */
export function renderChangeMatrix(rows: readonly MatrixRow[], commits: readonly Commit[], sweeps: ReadonlySet<number>, at = commits.length - 1): string {
  const width = (W - LABEL - RIGHT) / Math.max(1, commits.length);
  const x = (commit: number) => LABEL + commit * width;
  const { markup, bottom } = rowsOf(rows, x, width);
  // A commit before the last is shown: a line where it is, and what came after it faded, still there but not yet.
  const now =
    at < commits.length - 1
      ? `<rect class="future" x="${fixed(x(at + 1))}" y="0" width="${fixed(x(commits.length) - x(at + 1))}" height="${fixed(bottom)}"/><line class="now" x1="${fixed(x(at) + width / 2)}" x2="${fixed(x(at) + width / 2)}" y1="0" y2="${fixed(bottom + 4)}"/>`
      : "";
  const shaded = [...sweeps]
    .map((sweep) => {
      const commit = commits[sweep];
      return commit ? `<rect class="sweep" x="${fixed(x(sweep))}" y="0" width="${fixed(width)}" height="${fixed(bottom)}"><title>${escapeHtml(`${dayOf(commit)}, a sweep: ${commit.subject}`)}</title></rect>` : "";
    })
    .join("");
  return (
    // Where the commits begin and how wide each is, in the drawing's own units, for a pointer to be read against.
    `<svg class="change-matrix" data-left="${LABEL}" data-step="${Number(width.toFixed(3))}" data-row="${ROW}" viewBox="0 0 ${W} ${fixed(bottom + AXIS)}" role="img" aria-label="${rows.length} boxes over ${commits.length} commits: where each commit changed files, and where it wrote new ones">` +
    `${shaded}${markup}${now}${daysOf(commits, x, bottom)}</svg>`
  );
}
