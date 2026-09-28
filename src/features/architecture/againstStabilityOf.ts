import type { BoxLink } from "./Layout";
import type { BoxStability } from "./stabilityOf";

/** An arrow between boxes that goes against stability: from a box to one less stable, by `rise`. */
export interface AgainstStability {
  readonly from: string;
  readonly to: string;
  /** Files it joins, as the picture's box arrows count them. */
  readonly count: number;
  /** How much less stable the box it points to is. */
  readonly rise: number;
}

/**
 * The arrows between boxes that go against Robert C. Martin's rule of stable
 * dependencies — depend in the direction of stability — from a box to one
 * whose instability is higher: something hard to change made to need
 * something easier to change, which will, and take it along. The steepest first.
 */
export function againstStabilityOf(links: readonly Pick<BoxLink, "from" | "to" | "count">[], boxes: readonly BoxStability[]): AgainstStability[] {
  const instability = new Map(boxes.map((box) => [box.box, box.instability]));
  return links
    .flatMap(({ from, to, count }) => {
      const [a, b] = [instability.get(from), instability.get(to)];
      return a !== undefined && a !== null && b !== undefined && b !== null && b > a ? [{ from, to, count, rise: b - a }] : [];
    })
    .sort((x, y) => y.rise - x.rise || y.count - x.count || x.from.localeCompare(y.from));
}
