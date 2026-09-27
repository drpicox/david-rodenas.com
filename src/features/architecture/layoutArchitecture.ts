import { boxCycles } from "./boxCycles";
import { boxOf } from "./boxOf";
import type { BallPlace, BandPlace, BoxLink, BoxPlace, Layout, LinkPlace } from "./Layout";
import type { Snapshot } from "./Snapshot";

export interface LayoutOptions {
  /** Put the tests in as balls too. */
  readonly tests?: boolean;
  /** How wide the picture may be before a row wraps. */
  readonly width?: number;
}

type Module = Snapshot["modules"][number];

const MARGIN = 12;
const PAD = 6;
const LABEL = 14;
const CELL = 14;
const BOX_GAP = 12;
const LINE_GAP = 14;
/** Room between rows for the arrows to be seen going down. */
const ROW_GAP = 40;
const BAND_PAD = 10;
const BAND_LABEL = 16;

const radiusOf = (lines: number) => Math.min(6, 2.2 + Math.sqrt(lines) / 4);
const labelOf = (box: string) => box.split("/").pop()?.replace(/\.ts$/, "") ?? box;
/** The level a box stands at: the frame, the features, or the files at the top of the source, the composition root among them. */
const bandOf = (box: string) => (box.includes("/") ? (box.split("/")[0] ?? box) : "src");

/** How high each node stands: one above the highest thing it needs, and nothing it needs at the bottom. A node met again on its own path counts as the bottom, so a circle cannot loop. */
function ranksOf(nodes: readonly string[], needs: ReadonlyMap<string, ReadonlySet<string>>): Map<string, number> {
  const rankOf = new Map<string, number>();
  const rank = (node: string): number => {
    const known = rankOf.get(node);
    if (known !== undefined) return known;
    rankOf.set(node, 0);
    const value = Math.max(-1, ...[...(needs.get(node) ?? [])].map(rank)) + 1;
    rankOf.set(node, value);
    return value;
  };
  for (const node of nodes) rank(node);
  return rankOf;
}

function linksBetween(snapshot: Snapshot, boxOfId: ReadonlyMap<number, string>): BoxLink[] {
  const linkOf = new Map<string, BoxLink>();
  for (const { from, to, typeOnly } of snapshot.dependencies) {
    const [a, b] = [boxOfId.get(from), boxOfId.get(to)];
    if (a === undefined || b === undefined || a === b) continue;
    const link = linkOf.get(`${a}>${b}`) ?? { from: a, to: b, count: 0, typeOnly: true };
    linkOf.set(`${a}>${b}`, { ...link, count: link.count + 1, typeOnly: link.typeOnly && typeOnly });
  }
  return [...linkOf.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}

/** The rows, top to bottom: each level in turn, and inside it, every box above what it needs, ordered to sit near what points at it. */
function rowsOf(boxes: readonly string[], links: readonly BoxLink[], circles: readonly string[][]): { band: string; boxes: string[] }[] {
  const groupOf = new Map(boxes.map((box) => [box, box]));
  for (const circle of circles) for (const box of circle) groupOf.set(box, circle[0] ?? box);
  const group = (box: string) => groupOf.get(box) ?? box;

  const bandNeeds = new Map<string, Set<string>>();
  const inside = new Map<string, Set<string>>();
  for (const { from, to } of links) {
    const [a, b] = [bandOf(from), bandOf(to)];
    if (a !== b) bandNeeds.set(a, (bandNeeds.get(a) ?? new Set()).add(b));
    else if (group(from) !== group(to)) inside.set(group(from), (inside.get(group(from)) ?? new Set()).add(group(to)));
  }
  const bands = [...new Set(boxes.map(bandOf))];
  const bandRank = ranksOf(bands, bandNeeds);
  bands.sort((a, b) => (bandRank.get(b) ?? 0) - (bandRank.get(a) ?? 0) || a.localeCompare(b));
  const rank = ranksOf([...new Set(boxes.map(group))], inside);

  const rows = bands.flatMap((band) => {
    const members = boxes.filter((box) => bandOf(box) === band);
    const levels = [...new Set(members.map((box) => rank.get(group(box)) ?? 0))].sort((a, b) => b - a);
    return levels.map((level) => ({ band, boxes: members.filter((box) => (rank.get(group(box)) ?? 0) === level).sort() }));
  });

  // A barycentre sweep, after Sugiyama: each row in the order of the boxes above that point at it.
  const positionOf = new Map<string, number>();
  for (const row of rows) {
    const key = (box: string) => {
      const above = links.filter((link) => link.to === box && positionOf.has(link.from)).map((link) => positionOf.get(link.from) ?? 0.5);
      return above.length ? above.reduce((sum, value) => sum + value, 0) / above.length : 0.5;
    };
    row.boxes.sort((a, b) => key(a) - key(b) || a.localeCompare(b));
    row.boxes.forEach((box, index) => positionOf.set(box, index / Math.max(1, row.boxes.length - 1)));
  }
  return rows;
}

function sizeOf(box: string, count: number) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * 2.2)));
  const inner = columns * CELL;
  return { columns, inner, width: Math.max(inner + PAD * 2, labelOf(box).length * 6 + PAD * 2), height: LABEL + Math.ceil(count / columns) * CELL + PAD };
}

/** The ends of every link, spread along the bottom of the box it leaves and the top of the box it reaches, each in the order of what is at the other end. */
function portsOf(links: readonly BoxLink[], placed: ReadonlyMap<string, BoxPlace>): LinkPlace[] {
  const centre = (name: string) => {
    const box = placed.get(name);
    return box ? box.x + box.width / 2 : 0;
  };
  const along = (box: BoxPlace | undefined, index: number, count: number) => (box ? box.x + (box.width * (index + 1)) / (count + 1) : 0);
  return links.map((link) => {
    const [from, to] = [placed.get(link.from), placed.get(link.to)];
    const leaving = links.filter((other) => other.from === link.from).sort((a, b) => centre(a.to) - centre(b.to));
    const arriving = links.filter((other) => other.to === link.to).sort((a, b) => centre(a.from) - centre(b.from));
    return {
      ...link,
      x1: along(from, leaving.indexOf(link), leaving.length),
      y1: from ? from.y + from.height : 0,
      x2: along(to, arriving.indexOf(link), arriving.length),
      y2: to ? to.y : 0,
    };
  });
}

/**
 * Where everything stands in one snapshot: a box for each folder of the frame
 * and each feature, its files as balls in a grid inside it; the boxes of each
 * level — the composition root, the features, the frame — in a band of their
 * own, the bands one above the other in the order they need each other; and
 * inside a band, the boxes in rows, each above everything it needs. So every
 * arrow between boxes points down, which is what an architecture whose
 * dependencies go one way looks like. Boxes caught in a circle share a row
 * and are marked: nothing can put them in order, which is why they are shown.
 */
export function layoutArchitecture(snapshot: Snapshot, { tests = false, width = 1100 }: LayoutOptions = {}): Layout {
  const modules = snapshot.modules.filter((module) => tests || !module.test);
  const kept = new Map(modules.map((module) => [module.id, module]));
  const boxOfId = new Map(modules.map((module) => [module.id, boxOf(module.path)]));
  const members = new Map<string, Module[]>();
  for (const module of [...modules].sort((a, b) => a.path.localeCompare(b.path))) {
    const box = boxOf(module.path);
    members.set(box, [...(members.get(box) ?? []), module]);
  }
  const links = linksBetween(snapshot, boxOfId);
  const circles = boxCycles({
    modules: [],
    dependencies: snapshot.dependencies.flatMap(({ from, to, typeOnly }) => {
      const [a, b] = [kept.get(from), kept.get(to)];
      return a && b ? [{ from: a.path, to: b.path, typeOnly }] : [];
    }),
  });
  const cyclic = new Set(circles.flat());
  const rows = rowsOf([...members.keys()], links, circles);

  const bands: BandPlace[] = [];
  const placed = new Map<string, BoxPlace>();
  const balls: BallPlace[] = [];
  let y = MARGIN;
  rows.forEach((row, index) => {
    const opens = index === 0 || rows[index - 1]?.band !== row.band;
    const closes = rows[index + 1]?.band !== row.band;
    if (opens) {
      bands.push({ name: row.band, x: MARGIN, y, width: width - MARGIN * 2, height: 0 });
      y += BAND_LABEL + BAND_PAD;
    }
    // The row in lines that fit, each line centred, so a short row stands under the middle of what points at it.
    const room = width - (MARGIN + BAND_PAD) * 2;
    const lines: string[][] = [[]];
    let used = 0;
    for (const box of row.boxes) {
      const boxWidth = sizeOf(box, members.get(box)?.length ?? 0).width;
      if (used > 0 && used + boxWidth > room) {
        lines.push([]);
        used = 0;
      }
      lines[lines.length - 1]?.push(box);
      used += boxWidth + BOX_GAP;
    }
    let lineHeight = 0;
    lines.forEach((line, at) => {
      if (at > 0) y += lineHeight + LINE_GAP;
      const sizes = line.map((box) => sizeOf(box, members.get(box)?.length ?? 0));
      const lineWidth = sizes.reduce((sum, size) => sum + size.width, 0) + BOX_GAP * (line.length - 1);
      let x = MARGIN + BAND_PAD + (room - lineWidth) / 2;
      lineHeight = 0;
      line.forEach((box, which) => {
        const size = sizes[which] ?? sizeOf(box, 0);
        placed.set(box, { name: box, label: labelOf(box), x, y, width: size.width, height: size.height, rank: rows.length - index, cyclic: cyclic.has(box) });
        const left = x + (size.width - size.inner) / 2;
        (members.get(box) ?? []).forEach((module, place) => {
          const [column, row] = [place % size.columns, Math.floor(place / size.columns)];
          balls.push({ id: module.id, path: module.path, box, x: left + (column + 0.5) * CELL, y: y + LABEL + (row + 0.5) * CELL, radius: radiusOf(module.lines), test: module.test });
        });
        x += size.width + BOX_GAP;
        lineHeight = Math.max(lineHeight, size.height);
      });
    });
    y += lineHeight;
    if (closes) {
      const band = bands[bands.length - 1];
      if (band) bands[bands.length - 1] = { ...band, height: y + BAND_PAD - band.y };
      y += BAND_PAD;
    }
    y += ROW_GAP;
  });

  return { width, height: y - ROW_GAP + MARGIN, bands, boxes: [...placed.values()], balls, links: portsOf(links, placed) };
}
