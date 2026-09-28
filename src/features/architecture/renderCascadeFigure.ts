import { fixed } from "../../platform/charts/fixed";
import type { Cascade } from "./cascadeOf";
import { percent } from "./percent";

const W = 640;
const LABEL = 180;
const ROW = 26;
const THICK = 14;
/** Room at the end of the longest bar for what is written by it. */
const ROOM = 150;
const FAR = 4;

type Counted = { readonly seen: number; readonly changed: number };
const add = (rows: readonly Counted[]): Counted => rows.reduce((sum, row) => ({ seen: sum.seen + row.seen, changed: sum.changed + row.changed }), { seen: 0, changed: 0 });

/**
 * How far a change travels, as a figure: for files one arrow above a change,
 * two, three, and further, and for files with nothing changed below them, the
 * share that changed in the same commit — with what the arrows would allow
 * said beside it, since the arrows only say how far a change could go.
 */
export function renderCascadeFigure(cascade: readonly Cascade[], propagationCost: number): string {
  const at = (distance: number | null) => add(cascade.filter((row) => row.distance === distance));
  const rows: [string, Counted][] = [
    ["a file it needs changed", at(1)],
    ["two arrows down", at(2)],
    ["three", at(3)],
    ["four or more", add(cascade.filter((row) => row.distance !== null && row.distance >= FAR))],
    ["nothing it needs changed", at(null)],
  ];
  const share = ({ seen, changed }: Counted) => (seen > 0 ? changed / seen : 0);
  const top = Math.max(0.0001, ...rows.map(([, counted]) => share(counted)));
  const long = W - LABEL - ROOM;
  const bars = rows
    .map(([label, counted], index) => {
      const y = 8 + index * ROW;
      const length = Math.max(1, (share(counted) / top) * long);
      return (
        `<text class="label" x="${LABEL - 8}" y="${fixed(y + THICK - 3)}" text-anchor="end">${label}</text>` +
        `<rect class="bar${index === rows.length - 1 ? " none" : ""}" x="${LABEL}" y="${fixed(y)}" width="${fixed(length)}" height="${THICK}" rx="2"/>` +
        `<text class="value" x="${fixed(LABEL + length + 6)}" y="${fixed(y + THICK - 3)}">${percent(counted.changed, counted.seen)} · ${counted.changed} of ${counted.seen}</text>`
      );
    })
    .join("");
  const height = 8 + rows.length * ROW;
  const svg = `<svg class="cascade" viewBox="0 0 ${W} ${height}" role="img" aria-label="The share of files that changed with a change below them, by how far below it was">${bars}</svg>`;
  const [one, two, , , none] = rows.map(([, counted]) => percent(counted.changed, counted.seen));
  const said =
    `In theory, a change to one file can reach ${percent(propagationCost, 1)} of the source, on average: itself, what needs it, and what needs that, as far as the arrows go. ` +
    `In the history, when a file it needs changed, a file changed with it in ${one} of the commits; two arrows down, in ${two}; with nothing it needs changed, in ${none}.`;
  return `<figure class="changes-figure">${svg}<figcaption>${said}</figcaption></figure>`;
}
