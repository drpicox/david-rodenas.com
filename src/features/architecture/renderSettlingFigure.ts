import { fixed } from "../../platform/charts/fixed";
import type { Life } from "./Life";
import { percent } from "./percent";
import { plural } from "./plural";
import { settlingOf, type Settling } from "./settlingOf";

const W = 600;
const H = 190;
const PAD = { top: 18, right: 8, bottom: 36, left: 8 };
/** A bar no thicker than this, however few there are: the rest of its place is air. */
const THICKEST = 34;

const agesOf = ({ from, to }: Settling) => (from === to ? `${from}` : `${from}–${to}`);
/** Some bands counted as one. */
const together = (bands: readonly Settling[]) => bands.reduce((sum, band) => ({ lived: sum.lived + band.lived, changed: sum.changed + band.changed }), { lived: 0, changed: 0 });

/**
 * Whether a file settles, as a figure: for each band of ages, the share of
 * the commits a file lived through at that age that changed it, and what
 * that comes to said in words under it. Only what ships: a test changes when
 * what it tests does, and would say the same thing twice.
 */
export function renderSettlingFigure(lives: readonly Life[], commits: number): string {
  const shipped = lives.filter((life) => !life.test);
  const bands = settlingOf(shipped, commits);
  const share = (band: Settling) => (band.lived > 0 ? band.changed / band.lived : 0);
  const top = Math.max(0.0001, ...bands.map(share));
  const slot = (W - PAD.left - PAD.right) / Math.max(1, bands.length);
  const thick = Math.min(THICKEST, slot * 0.6);
  const base = H - PAD.bottom;
  const bars = bands
    .map((band, at) => {
      const height = (share(band) / top) * (base - PAD.top);
      const [x, y] = [PAD.left + slot * at + (slot - thick) / 2, base - height];
      return (
        `<rect class="bar" x="${fixed(x)}" y="${fixed(y)}" width="${fixed(thick)}" height="${fixed(height)}" rx="2"><title>${band.changed} of ${band.lived}</title></rect>` +
        `<text class="value" x="${fixed(x + thick / 2)}" y="${fixed(y - 4)}" text-anchor="middle">${percent(band.changed, band.lived)}</text>` +
        `<text class="age" x="${fixed(x + thick / 2)}" y="${fixed(base + 13)}" text-anchor="middle">${agesOf(band)}</text>`
      );
    })
    .join("");
  const svg =
    `<svg class="settling" viewBox="0 0 ${W} ${H}" role="img" aria-label="The share of commits that changed a file, by how many commits old it was">` +
    `<line class="base" x1="${PAD.left}" x2="${W - PAD.right}" y1="${fixed(base)}" y2="${fixed(base)}"/>${bars}` +
    `<text class="axis" x="${W / 2}" y="${H - 6}" text-anchor="middle">its age: the commits since the one that wrote it</text></svg>`;

  const alive = shipped.filter((life) => life.went === undefined);
  const never = alive.filter((life) => life.changed.length === 0).length;
  const early = together(bands.filter((band) => band.to <= 2));
  const late = together(bands.filter((band) => band.from > 8));
  const sentences = [`${never} of the ${plural(alive.length, "file")} that ship have not changed since the commit that wrote them.`];
  if (early.lived > 0) {
    const later = late.lived > 0 ? `, and in ${percent(late.changed, late.lived)} of those after its eighth` : "";
    sentences.push(`A file changed in ${percent(early.changed, early.lived)} of the first two commits it lived through${later}.`);
  }
  const said = sentences.join(" ");
  return `<figure class="changes-figure">${svg}<figcaption>${said}</figcaption></figure>`;
}
