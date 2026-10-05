/** An axis: where it starts and ends, its ticks, and where along it a value falls, 0 to 1. */
export interface Scale {
  readonly low: number;
  readonly high: number;
  readonly ticks: readonly number[];
  at(value: number): number;
}

/** A step a person reads at a glance: 1, 2, 2.5 or 5 of some power of ten. */
function niceStep(span: number, count: number): number {
  const rough = span / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].find((each) => each * power >= rough) ?? 10;
  return step * power;
}

/** Floating point leaves 0.30000000000000004 behind; a tick should read 0.3. */
const tidy = (value: number) => Number(value.toPrecision(12));

/**
 * The axis for some values: from a round number below the lowest to one
 * above the highest, ticked at round steps, about five of them. Bars start
 * at zero, or they lie about the size of what they show; a line through the
 * years need not.
 */
export function scaleOf(values: readonly number[], { zero = false, count = 5 }: { readonly zero?: boolean; readonly count?: number } = {}): Scale {
  const finite = values.filter(Number.isFinite);
  let [lowest, highest] = finite.length > 0 ? [Math.min(...finite), Math.max(...finite)] : [0, 1];
  if (zero) [lowest, highest] = [Math.min(0, lowest), Math.max(0, highest)];
  if (lowest === highest) [lowest, highest] = lowest === 0 ? [0, 1] : [lowest - Math.abs(lowest) / 2, highest + Math.abs(highest) / 2];
  const step = niceStep(highest - lowest, count);
  const [low, high] = [tidy(Math.floor(lowest / step) * step), tidy(Math.ceil(highest / step) * step)];
  const ticks: number[] = [];
  for (let tick = low; tick <= high + step / 2; tick += step) ticks.push(tidy(tick));
  return { low, high, ticks, at: (value) => (high > low ? (value - low) / (high - low) : 0.5) };
}
