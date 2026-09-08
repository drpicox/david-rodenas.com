import { escapeHtml } from "../escapeHtml";
import { type LaidEdge, layoutFlow } from "./layoutFlow";
import { parseFlow } from "./parseFlow";

/** Text sits this far below the top of its box; each line after the first is one line-height down. */
const FIRST_BASELINE = 20;
const LINE_H = 17;

/** A short name for this diagram's arrowhead, from its own text, so two diagrams on a page do not share one. */
function nameOf(source: string): string {
  let hash = 5381;
  for (let i = 0; i < source.length; i += 1) hash = ((hash * 33) ^ source.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

const fmt = (n: number) => String(Math.round(n * 10) / 10);

/**
 * A smooth path through the edge's points, leaving each one straight along the
 * flow's axis, so an arrow leaves a box squarely and arrives squarely.
 */
function pathOf(edge: LaidEdge, lr: boolean): string {
  const [first, ...rest] = edge.points;
  if (!first) return "";
  let d = `M${fmt(first[0])},${fmt(first[1])}`;
  let from = first;
  for (const to of rest) {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const c1: [number, number] = lr ? [(x1 + x2) / 2, y1] : [x1, (y1 + y2) / 2];
    const c2: [number, number] = lr ? [(x1 + x2) / 2, y2] : [x2, (y1 + y2) / 2];
    d += ` C${fmt(c1[0])},${fmt(c1[1])} ${fmt(c2[0])},${fmt(c2[1])} ${fmt(x2)},${fmt(y2)}`;
    from = to;
  }
  return d;
}

/** Where a label sits on an edge: halfway along its middle stretch. */
function labelSpot(edge: LaidEdge): [number, number] {
  const { points } = edge;
  const a = points[Math.floor((points.length - 1) / 2)] ?? [0, 0];
  const b = points[Math.ceil((points.length - 1) / 2)] ?? a;
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/**
 * Draws a flowchart as inline SVG, at build time.
 *
 * The picture is in the HTML like every word on the page: no script draws it,
 * nothing is fetched, and it is coloured by the page's own stylesheet, so it
 * changes with the theme like the text around it. Its width is its own, and
 * it shrinks with the column rather than growing past it.
 */
export function renderFlow(source: string): string {
  const layout = layoutFlow(parseFlow(source));
  const lr = layout.direction === "LR";
  const arrow = `arrow-${nameOf(source)}`;

  const edges = layout.edges
    .map((edge) => {
      const path = `<path class="edge" d="${pathOf(edge, lr)}" marker-end="url(#${arrow})"/>`;
      if (edge.label === undefined) return path;
      const [x, y] = labelSpot(edge);
      return `${path}<text class="edge-label" x="${fmt(x)}" y="${fmt(y)}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(edge.label)}</text>`;
    })
    .join("");

  const nodes = layout.nodes
    .map((node) => {
      const cx = node.x + node.width / 2;
      const lines = node.label.split("\n");
      const top = node.y + (node.height - lines.length * LINE_H) / 2;
      const text = lines
        .map((line, i) => `<tspan x="${fmt(cx)}" y="${fmt(top + FIRST_BASELINE - 8 + i * LINE_H)}">${escapeHtml(line)}</tspan>`)
        .join("");
      return (
        `<g class="node"><rect x="${fmt(node.x)}" y="${fmt(node.y)}" width="${fmt(node.width)}" height="${fmt(node.height)}" rx="4"/>` +
        `<text text-anchor="middle" dominant-baseline="middle">${text}</text></g>`
      );
    })
    .join("");

  const w = fmt(layout.width);
  const h = fmt(layout.height);
  return (
    `<figure class="flow"><svg class="flow" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width: 100%; height: auto" role="img">` +
    `<defs><marker id="${arrow}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>` +
    `${edges}${nodes}</svg></figure>`
  );
}
