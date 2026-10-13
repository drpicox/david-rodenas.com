import type { Point } from "../../platform/blueprint/nodeShapeOf";

const round = (value: number) => Math.round(value * 10) / 10;
const said = ({ x, y }: Point) => `${round(x)} ${round(y)}`;
const same = (a: Point, b: Point) => round(a.x) === round(b.x) && round(a.y) === round(b.y);
const length = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
/** The point so far along the way from one point to another. */
const along = (from: Point, to: Point, far: number): Point => {
  const whole = length(from, to) || 1;
  return { x: from.x + ((to.x - from.x) * far) / whole, y: from.y + ((to.y - from.y) * far) / whole };
};
/** Whether the way through three points turns at the middle one. */
const turns = (a: Point, b: Point, c: Point) => Math.abs((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)) > 1e-6;

/**
 * A conduit as an LCARS display draws one: straight runs, level or upright,
 * joined by a curve at every turn — never the S of a wire pulled by hand.
 * The curve is as wide as asked, or as half the shorter run beside it
 * allows, so two turns close together still meet.
 */
export function conduitPath(points: readonly Point[], radius: number): string {
  const apart = points.filter((point, at) => at === 0 || !same(point, points[at - 1] as Point));
  const corners = apart.filter((point, at) => at === 0 || at === apart.length - 1 || turns(apart[at - 1] as Point, point, apart[at + 1] as Point));
  const [first, ...rest] = corners;
  if (!first || rest.length === 0) return "";
  const steps = [`M${said(first)}`];
  let here = first;
  const lineTo = (point: Point) => {
    if (!same(here, point)) steps.push(`L${said(point)}`);
    here = point;
  };
  rest.forEach((corner, at) => {
    const before = corners[at] as Point;
    const after = rest[at + 1];
    if (!after) return lineTo(corner);
    const curve = Math.min(radius, length(before, corner) / 2, length(corner, after) / 2);
    lineTo(along(corner, before, curve));
    here = along(corner, after, curve);
    steps.push(`Q${said(corner)} ${said(here)}`);
  });
  return steps.join(" ");
}
