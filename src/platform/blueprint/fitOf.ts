/** A straight line through points, as least squares fit it, and how close the points keep to it. */
export interface Fit {
  readonly n: number;
  /** Pearson's correlation, −1 to 1: how nearly the points lie on a rising or a falling line. None when either side never moves. */
  readonly r: number;
  readonly slope: number;
  readonly intercept: number;
}

/** The least-squares line through paired values, and Pearson's r of them. Fewer than two points, or no spread, has none. */
export function fitOf(xs: readonly number[], ys: readonly number[]): Fit {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return { n, r: Number.NaN, slope: Number.NaN, intercept: Number.NaN };
  const mean = (values: readonly number[]) => values.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const [mx, my] = [mean(xs), mean(ys)];
  let [sxx, syy, sxy] = [0, 0, 0];
  for (let at = 0; at < n; at += 1) {
    const [dx, dy] = [(xs[at] ?? 0) - mx, (ys[at] ?? 0) - my];
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const slope = sxx > 0 ? sxy / sxx : Number.NaN;
  return { n, r: sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : Number.NaN, slope, intercept: my - slope * mx };
}
