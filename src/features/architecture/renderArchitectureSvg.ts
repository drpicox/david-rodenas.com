import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { Layout, LinkPlace } from "./Layout";

const round = (value: number) => Math.round(value * 10) / 10;

/** From where a link leaves the bottom of one box to where it reaches the top of the other, leaving and arriving upright. */
function curve({ x1, y1, x2, y2 }: LinkPlace): string {
  const bend = Math.max(18, (y2 - y1) / 2);
  return `M${round(x1)} ${round(y1)} C${round(x1)} ${round(y1 + bend)} ${round(x2)} ${round(y2 - bend)} ${round(x2)} ${round(y2)}`;
}

/** How each ball is to look when not as the layout has it: as big as a measure, coloured by another, in a class of its own. */
export interface BallLook {
  readonly radii?: ReadonlyMap<number, number>;
  readonly fills?: ReadonlyMap<number, string>;
  readonly classes?: ReadonlyMap<number, string>;
}

/**
 * One snapshot drawn: the boxes, the files as balls inside them, and an arrow
 * for each box that needs another — thicker the more files it needs there,
 * dashed when all it needs is a type. Plain SVG, so the page carries it in
 * its HTML before any script, and the script only makes it move. A ball can
 * be made to look as something else says: a blueprint sizes and colours them.
 */
export function renderArchitectureSvg(layout: Layout, look: BallLook = {}): string {
  const bands = layout.bands
    .map((band) => `<g class="band" data-band="${escapeHtml(band.name)}"><rect x="${round(band.x)}" y="${round(band.y)}" width="${round(band.width)}" height="${round(band.height)}" rx="6"/><text x="${round(band.x + 8)}" y="${round(band.y + 12)}">${escapeHtml(band.name)}</text></g>`)
    .join("");
  const links = layout.links
    .map((link) => {
      const width = round(Math.min(4, 0.8 + Math.log2(link.count) * 0.7));
      return `<path class="link${link.typeOnly ? " type-only" : ""}" stroke-width="${width}" d="${curve(link)}" marker-end="url(#arrowhead)"><title>${escapeHtml(`${link.from} → ${link.to}: ${link.count}`)}</title></path>`;
    })
    .join("");
  const boxes = layout.boxes
    .map(
      (box) =>
        `<g class="box${box.cyclic ? " cyclic" : ""}" data-box="${escapeHtml(box.name)}"><rect x="${round(box.x)}" y="${round(box.y)}" width="${round(box.width)}" height="${round(box.height)}" rx="4"/>` +
        `<text x="${round(box.x + 6)}" y="${round(box.y + 10)}">${escapeHtml(box.label)}</text></g>`,
    )
    .join("");
  const balls = layout.balls
    .map((ball) => {
      const extra = look.classes?.get(ball.id);
      const fill = look.fills?.get(ball.id);
      return `<circle class="ball${ball.test ? " test" : ""}${extra ? ` ${escapeHtml(extra)}` : ""}" cx="${round(ball.x)}" cy="${round(ball.y)}" r="${round(look.radii?.get(ball.id) ?? ball.radius)}"${fill ? ` style="fill: ${escapeHtml(fill)}"` : ""}><title>${escapeHtml(ball.path)}</title></circle>`;
    })
    .join("");
  const said = `${layout.boxes.length} boxes, ${layout.balls.length} files, ${layout.links.length} arrows between boxes`;
  return (
    `<svg class="architecture" viewBox="0 0 ${layout.width} ${round(layout.height)}" role="img" aria-label="${said}">` +
    `<defs><marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker></defs>` +
    `<g class="bands">${bands}</g><g class="links">${links}</g><g class="boxes">${boxes}</g><g class="balls">${balls}</g></svg>`
  );
}
